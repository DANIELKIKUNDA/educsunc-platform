import '../../config/variables-environnement.config';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';

import { RefreshTokenSaga } from '../../shared/auth/application';
import { ContexteActifAuth, MoteurRefreshToken, RefreshToken, SessionUtilisateur, TentativeConnexion, UtilisateurAuth } from '../../shared/auth/domain';
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
  SessionCacheService,
  creerPoolPostgresAuth,
} from '../../shared/auth/infrastructure';

const phase = process.argv.find((argument) => argument.startsWith('--phase='))?.split('=')[1];
const suffixe = process.env.EDUCSYN_AUTH_CERT_SUFFIX ?? randomUUID();
const utilisateurId = `auth-restart-${suffixe}`;
const email = `${utilisateurId}@educsync.test`;
const refreshTokenBrut = `restart-${suffixe.replaceAll('-', '')}-refresh-token-edusync`;
const organisationId = `org-restart-${suffixe}`;
const jwt = new JwtTokenAdapter({ secretJwt: 'secret-certification-redemarrage-auth-educsyn' });
const tokenHash = jwt.hacherRefreshTokenSynchrone(refreshTokenBrut);

async function executerPhase(): Promise<void> {
  const pool = creerPoolPostgresAuth();
  const client = new ClientPoolPostgresAuth(pool);
  const utilisateurs = new PostgresUtilisateurAuthRepository(client);
  const refreshTokens = new PostgresRefreshTokenRepository(client);
  const sessions = new PostgresSessionUtilisateurRepository(client);
  const contextes = new PostgresContexteActifAuthRepository(client);
  const tentatives = new PostgresTentativeConnexionRepository(client);
  const transaction = new AuthTransactionManager(client);

  try {
    await new MigrateurPostgresAuth(pool).executerToutes();
    if (phase === 'write') {
      const utilisateur = UtilisateurAuth.creer({
        idUtilisateur: utilisateurId,
        nomComplet: 'Certification redemarrage Auth',
        email,
        motDePasseHash: 'scrypt:test:test',
      });
      utilisateur.incrementerTentativeConnexion();
      utilisateur.verrouillerCompte(new Date(Date.now() + 60_000));
      const refreshToken = RefreshToken.creer({
        idUtilisateur: utilisateurId,
        tokenHash,
        tokenVersionEmise: 1,
      });
      const session = SessionUtilisateur.ouvrir({
        idUtilisateur: utilisateurId,
        refreshTokenId: refreshToken.obtenirId(),
        organisationActiveId: organisationId,
      });
      refreshToken.associerSession(session.obtenirId());
      const contexte = ContexteActifAuth.creer(utilisateurId);
      contexte.changerOrganisationActive(organisationId);
      const tentative = TentativeConnexion.creer({ email });
      tentative.marquerEchec('certification-redemarrage');

      await utilisateurs.sauvegarder(utilisateur);
      await refreshTokens.sauvegarder(refreshToken);
      await sessions.sauvegarder(session);
      await contextes.sauvegarder(contexte);
      await tentatives.sauvegarder(tentative);
      process.stdout.write(JSON.stringify({ sessionId: session.obtenirId() }));
      return;
    }

    const utilisateur = await utilisateurs.trouverParId(utilisateurId);
    const contexte = await contextes.trouverContexteUtilisateur(utilisateurId);
    const token = await refreshTokens.trouverParHash(tokenHash);
    const traces = await tentatives.listerTentativesUtilisateur(utilisateurId);
    const sessionResultat = await pool.query<{ id_session_utilisateur: string }>(
      'SELECT id_session_utilisateur FROM auth_sessions_utilisateurs WHERE id_utilisateur = $1',
      [utilisateurId],
    );
    assert.ok(utilisateur);
    assert.equal(utilisateur.obtenirNombreTentativesConnexion(), 1);
    assert.ok(utilisateur.obtenirCompteVerrouilleJusqua());
    assert.equal(contexte?.obtenirOrganisationActiveId(), organisationId);
    assert.ok(token);
    assert.ok(token.obtenirIdSessionUtilisateur());
    assert.equal(traces.length, 1);
    assert.equal(sessionResultat.rowCount, 1);

    // La persistance du verrouillage est prouvee ci-dessus; seule une levee explicite autorise la rotation.
    utilisateur.deverrouillerCompte();
    await utilisateurs.sauvegarder(utilisateur);

    const rotation = await new RefreshTokenSaga(
      transaction,
      refreshTokens,
      sessions,
      utilisateurs,
      jwt,
      new MoteurRefreshToken({
        genererRefreshTokenValue: () => `rotation-${suffixe.replaceAll('-', '')}`,
        hacherRefreshToken: (valeur) => jwt.hacherRefreshTokenSynchrone(valeur),
      }),
      new SessionCacheService(),
    ).executer({
      refreshToken: refreshTokenBrut,
      sessionId: token.obtenirIdSessionUtilisateur()!,
    });
    assert.equal(rotation.sessionId, token.obtenirIdSessionUtilisateur());
    assert.equal((await refreshTokens.trouverParId(token.obtenirId()))?.obtenirRevoque(), true);

    await pool.query('DELETE FROM auth_sessions_utilisateurs WHERE id_utilisateur = $1', [utilisateurId]);
    await pool.query('DELETE FROM auth_contextes_actifs WHERE id_utilisateur = $1', [utilisateurId]);
    await pool.query('DELETE FROM auth_tentatives_connexion WHERE email = $1', [email]);
    await pool.query('DELETE FROM auth_refresh_tokens WHERE id_utilisateur = $1', [utilisateurId]);
    await pool.query('DELETE FROM auth_utilisateurs WHERE id_utilisateur = $1', [utilisateurId]);
  } finally {
    await pool.end();
  }
}

function executerCertificationMultiProcessus(): void {
  const lanceur = process.execPath;
  const tsxCli = require.resolve('tsx/cli');
  const script = __filename;
  for (const phaseCourante of ['write', 'read']) {
    const resultat = spawnSync(lanceur, [tsxCli, script, `--phase=${phaseCourante}`], {
      cwd: process.cwd(),
      env: { ...process.env, EDUCSYN_AUTH_CERT_SUFFIX: suffixe },
      encoding: 'utf8',
    });
    if (resultat.status !== 0) {
      throw new Error(resultat.stderr || `La phase ${phaseCourante} a echoue.`);
    }
  }
  process.stdout.write('Persistance Auth PostgreSQL certifiee apres redemarrage reel.\n');
}

if (phase) {
  void executerPhase();
} else {
  executerCertificationMultiProcessus();
}
