import '../../../../config/variables-environnement.config';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';

import { LogoutSaga } from '../../application/sagas/LogoutSaga';
import { LoginSaga } from '../../application/sagas/LoginSaga';
import { AuditAuthApplicationService } from '../../application/services/AuditAuthApplicationService';
import {
  ContexteActifAuth,
  RefreshToken,
  SessionUtilisateur,
  TentativeConnexion,
  UtilisateurAuth,
  MoteurAuthentification,
} from '../../domain';
import {
  AuthTransactionManager,
  ClientPoolPostgresAuth,
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

test('PostgreSQL Auth persiste les agregats, rollback et arbitre les refresh concurrents', {
  skip: !executerPostgres,
}, async () => {
  const suffixe = randomUUID();
  const utilisateurId = `auth-integration-${suffixe}`;
  const email = `${utilisateurId}@educsync.test`;
  const pool = creerPoolPostgresAuth();
  const client = new ClientPoolPostgresAuth(pool);
  const utilisateurs = new PostgresUtilisateurAuthRepository(client);
  const refreshTokens = new PostgresRefreshTokenRepository(client);
  const sessions = new PostgresSessionUtilisateurRepository(client);
  const contextes = new PostgresContexteActifAuthRepository(client);
  const tentatives = new PostgresTentativeConnexionRepository(client);
  const transaction = new AuthTransactionManager(client);

  await new MigrateurPostgresAuth(pool).executerToutes();

  try {
    const utilisateur = UtilisateurAuth.creer({
      idUtilisateur: utilisateurId,
      nomComplet: 'Certification Auth',
      email,
      motDePasseHash: 'scrypt:test:test',
    });
    const refreshToken = RefreshToken.creer({
      idUtilisateur: utilisateurId,
      tokenHash: `hash-${suffixe.replaceAll('-', '')}`,
      tokenVersionEmise: 1,
    });
    const session = SessionUtilisateur.ouvrir({
      idUtilisateur: utilisateurId,
      refreshTokenId: refreshToken.obtenirId(),
      roleActif: 'MANAGER_SYSTEME',
      organisationActiveId: `org-${suffixe}`,
    });
    refreshToken.associerSession(session.obtenirId());
    const contexte = ContexteActifAuth.creer(utilisateurId);
    contexte.changerOrganisationActive(`org-${suffixe}`);
    const tentative = TentativeConnexion.creer({ email });
    tentative.marquerEchec('test-integration');

    await transaction.executerDansTransaction(async () => {
      await utilisateurs.sauvegarder(utilisateur);
      await refreshTokens.sauvegarder(refreshToken);
      await sessions.sauvegarder(session);
      await contextes.sauvegarder(contexte);
      await tentatives.sauvegarder(tentative);
    });

    assert.ok(await utilisateurs.trouverParEmail(email));
    assert.equal(
      (await sessions.trouverSessionActive(session.obtenirId()))?.obtenirRoleActif(),
      'MANAGER_SYSTEME',
    );
    assert.ok(await refreshTokens.trouverParHash(refreshToken.obtenirTokenHash()));
    assert.equal((await contextes.trouverContexteUtilisateur(utilisateurId))?.obtenirOrganisationActiveId(), `org-${suffixe}`);
    assert.equal((await tentatives.listerTentativesUtilisateur(utilisateurId)).length, 1);

    const refreshLogout = RefreshToken.creer({
      idUtilisateur: utilisateurId,
      tokenHash: `logout-${suffixe.replaceAll('-', '')}`,
      tokenVersionEmise: 1,
    });
    const sessionLogout = SessionUtilisateur.ouvrir({
      idUtilisateur: utilisateurId,
      refreshTokenId: refreshLogout.obtenirId(),
    });
    refreshLogout.associerSession(sessionLogout.obtenirId());
    await refreshTokens.sauvegarder(refreshLogout);
    await sessions.sauvegarder(sessionLogout);
    const logout = new LogoutSaga(
      transaction,
      sessions,
      refreshTokens,
      new SessionCachePortMemoire(),
      new AuditAuthApplicationService(new SecurityAuditPortMemoire()),
    );
    await logout.executer({ sessionId: sessionLogout.obtenirId() });
    assert.equal(await sessions.trouverSessionActive(sessionLogout.obtenirId()), null);
    assert.equal(
      (await refreshTokens.trouverParId(refreshLogout.obtenirId()))?.obtenirRevoque(),
      true,
    );

    const auditConcurrent = new SecurityAuditPortMemoire();
    const loginConcurrent = new LoginSaga(
      transaction,
      utilisateurs,
      sessions,
      refreshTokens,
      contextes,
      tentatives,
      new SecurityAuthorizationPortMemoire([`org-${suffixe}`]),
      new AuditAuthApplicationService(auditConcurrent),
      new MoteurAuthentification({
        verifierMotDePasse: () => true,
        genererJwt: () => `jwt-${randomUUID()}`,
        genererRefreshTokenValue: () => randomUUID().replaceAll('-', ''),
        hacherRefreshToken: () => randomUUID().replaceAll('-', ''),
      }),
    );
    const connexionsConcurrentes = await Promise.all([
      loginConcurrent.executer({ email, motDePasse: 'test', organisationActiveId: `org-${suffixe}` }),
      loginConcurrent.executer({ email, motDePasse: 'test', organisationActiveId: `org-${suffixe}` }),
    ]);
    assert.equal(connexionsConcurrentes.length, 2);
    assert.notEqual(connexionsConcurrentes[0].sessionId, connexionsConcurrentes[1].sessionId);

    const rollbackId = `rollback-${suffixe}`;
    await assert.rejects(() => transaction.executerDansTransaction(async () => {
      await utilisateurs.sauvegarder(UtilisateurAuth.creer({
        idUtilisateur: rollbackId,
        nomComplet: 'Rollback Auth',
        email: `${rollbackId}@educsync.test`,
        motDePasseHash: 'scrypt:test:test',
      }));
      throw new Error('rollback-attendu');
    }));
    assert.equal(await utilisateurs.trouverParId(rollbackId), null);

    const tokenA = await refreshTokens.trouverParId(refreshToken.obtenirId());
    const tokenB = await refreshTokens.trouverParId(refreshToken.obtenirId());
    assert.ok(tokenA && tokenB);
    tokenA.revoquer();
    tokenB.revoquer();
    const rotations = await Promise.allSettled([
      refreshTokens.sauvegarder(tokenA),
      refreshTokens.sauvegarder(tokenB),
    ]);
    assert.equal(rotations.filter((resultat) => resultat.status === 'fulfilled').length, 1);
    assert.equal(rotations.filter((resultat) => resultat.status === 'rejected').length, 1);
  } finally {
    await pool.query('DELETE FROM auth_sessions_utilisateurs WHERE id_utilisateur = $1', [utilisateurId]);
    await pool.query('DELETE FROM auth_contextes_actifs WHERE id_utilisateur = $1', [utilisateurId]);
    await pool.query('DELETE FROM auth_tentatives_connexion WHERE email = $1', [email]);
    await pool.query('DELETE FROM auth_refresh_tokens WHERE id_utilisateur = $1', [utilisateurId]);
    await pool.query('DELETE FROM auth_utilisateurs WHERE id_utilisateur IN ($1, $2)', [utilisateurId, `rollback-${suffixe}`]);
    await pool.end();
  }
});
