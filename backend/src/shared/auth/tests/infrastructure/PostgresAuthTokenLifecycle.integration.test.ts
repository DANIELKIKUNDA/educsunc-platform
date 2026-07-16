import '../../../../config/variables-environnement.config';

import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import test from 'node:test';
import {
  AuditAuthApplicationService,
  LoginSaga,
  LogoutSaga,
  RefreshTokenSaga,
  RevoquerToutesSessionsUtilisateurUseCase,
} from '../../application';
import { MoteurAuthentification, MoteurRefreshToken, UtilisateurAuth } from '../../domain';
import {
  AuthTransactionManager,
  ClientPoolPostgresAuth,
  JwtTokenAdapter,
  MigrateurPostgresAuth,
  PostgresContexteActifAuthRepository,
  PostgresRefreshTokenRepository,
  PostgresSessionUtilisateurRepository,
  PostgresTentativeConnexionRepository,
  PostgresUtilisateurAuthRepository,
  creerPoolPostgresAuth,
} from '../../infrastructure';
import {
  SecurityAuditPortMemoire,
  SecurityAuthorizationPortMemoire,
  SessionCachePortMemoire,
} from '../support/AuthTestSupport';

const executerPostgres = process.env.EDUCSYN_RUN_POSTGRES_INTEGRATION === '1';

test('PostgreSQL certifie rotation, rejeu, sessions multiples et revocations Auth', {
  skip: !executerPostgres,
}, async () => {
  const suffixe = randomUUID();
  const utilisateurId = `auth-cycle-${suffixe}`;
  const email = `${utilisateurId}@educsync.test`;
  const organisationId = `org-${suffixe}`;
  const pool = creerPoolPostgresAuth();
  const client = new ClientPoolPostgresAuth(pool);
  const utilisateurs = new PostgresUtilisateurAuthRepository(client);
  const refreshTokens = new PostgresRefreshTokenRepository(client);
  const sessions = new PostgresSessionUtilisateurRepository(client);
  const contextes = new PostgresContexteActifAuthRepository(client);
  const tentatives = new PostgresTentativeConnexionRepository(client);
  const transaction = new AuthTransactionManager(client);
  const cache = new SessionCachePortMemoire();
  const audit = new AuditAuthApplicationService(new SecurityAuditPortMemoire());
  const jwt = new JwtTokenAdapter({
    secretJwt: 'secret-integration-auth-postgresql-educsyn',
    emetteur: 'educsyn-integration',
    audience: 'educsyn-integration-clients',
  });
  const nouveauRefresh = () => randomBytes(48).toString('base64url');
  const login = new LoginSaga(
    transaction,
    utilisateurs,
    sessions,
    refreshTokens,
    contextes,
    tentatives,
    new SecurityAuthorizationPortMemoire([organisationId]),
    audit,
    new MoteurAuthentification({
      verifierMotDePasse: (clair, hash) => clair === 'mot-de-passe-test' && hash === 'hash-test',
      genererJwt: (payload) => jwt.signerJwtSynchrone(payload),
      genererRefreshTokenValue: nouveauRefresh,
      hacherRefreshToken: (valeur) => jwt.hacherRefreshTokenSynchrone(valeur),
    }),
  );
  const rotation = new RefreshTokenSaga(
    transaction,
    refreshTokens,
    sessions,
    utilisateurs,
    jwt,
    new MoteurRefreshToken({
      genererRefreshTokenValue: nouveauRefresh,
      hacherRefreshToken: (valeur) => jwt.hacherRefreshTokenSynchrone(valeur),
    }),
    cache,
    audit,
  );
  const logout = new LogoutSaga(transaction, sessions, refreshTokens, cache, audit);
  const revoquerTout = new RevoquerToutesSessionsUtilisateurUseCase(
    transaction,
    utilisateurs,
    sessions,
    refreshTokens,
    audit,
  );

  await new MigrateurPostgresAuth(pool).executerToutes();
  try {
    await utilisateurs.sauvegarder(UtilisateurAuth.creer({
      idUtilisateur: utilisateurId,
      nomComplet: 'Cycle Auth PostgreSQL',
      email,
      motDePasseHash: 'hash-test',
    }));

    const appareilA = await login.executer({ email, motDePasse: 'mot-de-passe-test', organisationActiveId: organisationId, deviceId: 'appareil-a' });
    const appareilB = await login.executer({ email, motDePasse: 'mot-de-passe-test', organisationActiveId: organisationId, deviceId: 'appareil-b' });
    const appareilC = await login.executer({ email, motDePasse: 'mot-de-passe-test', organisationActiveId: organisationId, deviceId: 'appareil-c' });
    const appareilD = await login.executer({ email, motDePasse: 'mot-de-passe-test', organisationActiveId: organisationId, deviceId: 'appareil-d' });
    assert.notEqual(appareilA.sessionId, appareilB.sessionId);
    assert.equal((await jwt.decoderJwt<Record<string, unknown>>(appareilA.accessToken)).sid, appareilA.sessionId);

    const rotationA = await rotation.executer({ refreshToken: appareilA.refreshToken, sessionId: appareilA.sessionId });
    assert.equal(rotationA.sessionId, appareilA.sessionId);
    await assert.rejects(() => rotation.executer({ refreshToken: appareilA.refreshToken, sessionId: appareilA.sessionId }));
    assert.equal(await sessions.trouverSessionActive(appareilA.sessionId), null, 'le rejeu doit revoquer la session compromise');

    const concurrentes = await Promise.allSettled([
      rotation.executer({ refreshToken: appareilB.refreshToken, sessionId: appareilB.sessionId }),
      rotation.executer({ refreshToken: appareilB.refreshToken, sessionId: appareilB.sessionId }),
    ]);
    assert.equal(concurrentes.filter((resultat) => resultat.status === 'fulfilled').length, 1);
    assert.equal(concurrentes.filter((resultat) => resultat.status === 'rejected').length, 1);

    await logout.executer({ sessionId: appareilC.sessionId });
    await logout.executer({ sessionId: appareilC.sessionId });
    assert.equal(await sessions.trouverSessionActive(appareilC.sessionId), null);
    await assert.rejects(() => rotation.executer({ refreshToken: appareilC.refreshToken, sessionId: appareilC.sessionId }));
    assert.ok(await sessions.trouverSessionActive(appareilD.sessionId), 'le logout courant ne doit pas fermer un autre appareil');

    const appareilPersistant = await login.executer({
      email,
      motDePasse: 'mot-de-passe-test',
      organisationActiveId: organisationId,
      deviceId: 'appareil-persistant',
    });
    await pool.query(
      "UPDATE auth_sessions_utilisateurs SET cree_le = NOW() - INTERVAL '120 days' WHERE id_session_utilisateur = $1",
      [appareilPersistant.sessionId],
    );
    await pool.query(
      "UPDATE auth_refresh_tokens SET cree_le = NOW() - INTERVAL '120 days' WHERE id_session_utilisateur = $1",
      [appareilPersistant.sessionId],
    );
    assert.ok(await sessions.trouverSessionActive(appareilPersistant.sessionId), 'le temps seul ne doit pas terminer la session');

    const jwtExpire = new JwtTokenAdapter({
      secretJwt: 'secret-integration-auth-postgresql-educsyn',
      emetteur: 'educsyn-integration',
      audience: 'educsyn-integration-clients',
      dureeAccessTokenSecondes: -1,
    });
    const accessExpire = await jwtExpire.genererJwt({
      sub: utilisateurId,
      sid: appareilPersistant.sessionId,
      email,
      tokenVersion: 1,
    });
    await assert.rejects(() => jwtExpire.decoderJwt(accessExpire));
    const renouvellementPersistant = await rotation.executer({
      refreshToken: appareilPersistant.refreshToken,
      sessionId: appareilPersistant.sessionId,
    });
    assert.ok(renouvellementPersistant.accessToken.length > 0, 'un access token expire doit pouvoir etre renouvele');

    const appareilSuspendu = await login.executer({ email, motDePasse: 'mot-de-passe-test', organisationActiveId: organisationId, deviceId: 'appareil-suspendu' });
    let compte = await utilisateurs.trouverParId(utilisateurId);
    assert.ok(compte);
    compte.suspendreCompte();
    await utilisateurs.sauvegarder(compte);
    await assert.rejects(() => rotation.executer({ refreshToken: appareilSuspendu.refreshToken, sessionId: appareilSuspendu.sessionId }));
    assert.equal(await sessions.trouverSessionActive(appareilSuspendu.sessionId), null);
    compte = await utilisateurs.trouverParId(utilisateurId);
    assert.ok(compte);
    compte.activerCompte();
    await utilisateurs.sauvegarder(compte);

    const appareilDesactive = await login.executer({ email, motDePasse: 'mot-de-passe-test', organisationActiveId: organisationId, deviceId: 'appareil-desactive' });
    compte = await utilisateurs.trouverParId(utilisateurId);
    assert.ok(compte);
    compte.desactiverCompte();
    await utilisateurs.sauvegarder(compte);
    await assert.rejects(() => rotation.executer({ refreshToken: appareilDesactive.refreshToken, sessionId: appareilDesactive.sessionId }));
    assert.equal(await sessions.trouverSessionActive(appareilDesactive.sessionId), null);
    compte = await utilisateurs.trouverParId(utilisateurId);
    assert.ok(compte);
    compte.activerCompte();
    await utilisateurs.sauvegarder(compte);

    const appareilVerrouille = await login.executer({ email, motDePasse: 'mot-de-passe-test', organisationActiveId: organisationId, deviceId: 'appareil-verrouille' });
    compte = await utilisateurs.trouverParId(utilisateurId);
    assert.ok(compte);
    compte.verrouillerCompte(new Date(Date.now() + 60_000));
    await utilisateurs.sauvegarder(compte);
    await assert.rejects(() => rotation.executer({ refreshToken: appareilVerrouille.refreshToken, sessionId: appareilVerrouille.sessionId }));
    assert.equal(await sessions.trouverSessionActive(appareilVerrouille.sessionId), null);
    compte = await utilisateurs.trouverParId(utilisateurId);
    assert.ok(compte);
    compte.deverrouillerCompte();
    await utilisateurs.sauvegarder(compte);

    const appareilAncienneVersion = await login.executer({ email, motDePasse: 'mot-de-passe-test', organisationActiveId: organisationId, deviceId: 'appareil-ancienne-version' });
    compte = await utilisateurs.trouverParId(utilisateurId);
    assert.ok(compte);
    compte.incrementerTokenVersion();
    await utilisateurs.sauvegarder(compte);
    await assert.rejects(() => rotation.executer({ refreshToken: appareilAncienneVersion.refreshToken, sessionId: appareilAncienneVersion.sessionId }));
    assert.equal(await sessions.trouverSessionActive(appareilAncienneVersion.sessionId), null);

    const appareilAvantMotDePasse = await login.executer({ email, motDePasse: 'mot-de-passe-test', organisationActiveId: organisationId, deviceId: 'appareil-avant-mot-de-passe' });
    compte = await utilisateurs.trouverParId(utilisateurId);
    assert.ok(compte);
    compte.changerMotDePasse('hash-nouveau-mot-de-passe');
    await utilisateurs.sauvegarder(compte);
    await assert.rejects(() => rotation.executer({ refreshToken: appareilAvantMotDePasse.refreshToken, sessionId: appareilAvantMotDePasse.sessionId }));
    assert.equal(await sessions.trouverSessionActive(appareilAvantMotDePasse.sessionId), null);

    await revoquerTout.executer({ utilisateurId });
    assert.equal(await sessions.trouverSessionActive(appareilD.sessionId), null);
    await assert.rejects(() => rotation.executer({ refreshToken: appareilD.refreshToken, sessionId: appareilD.sessionId }));
    assert.ok(((await utilisateurs.trouverParId(utilisateurId))?.obtenirTokenVersion().obtenirValeur() ?? 0) > 1);
  } finally {
    await pool.query('DELETE FROM auth_sessions_utilisateurs WHERE id_utilisateur = $1', [utilisateurId]);
    await pool.query('DELETE FROM auth_contextes_actifs WHERE id_utilisateur = $1', [utilisateurId]);
    await pool.query('DELETE FROM auth_tentatives_connexion WHERE email = $1', [email]);
    await pool.query('DELETE FROM auth_refresh_tokens WHERE id_utilisateur = $1', [utilisateurId]);
    await pool.query('DELETE FROM auth_utilisateurs WHERE id_utilisateur = $1', [utilisateurId]);
    await pool.end();
  }
});
