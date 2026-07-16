import '../../config/variables-environnement.config';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { LogoutSaga, RefreshTokenSaga, RevoquerToutesSessionsUtilisateurUseCase } from '../../shared/auth/application';
import { MoteurRefreshToken, RefreshToken, SessionUtilisateur, UtilisateurAuth } from '../../shared/auth/domain';
import {
  AuthTransactionManager,
  ClientPoolPostgresAuth,
  JwtTokenAdapter,
  MigrateurPostgresAuth,
  PostgresRefreshTokenRepository,
  PostgresSessionUtilisateurRepository,
  PostgresUtilisateurAuthRepository,
  SessionCacheService,
  creerPoolPostgresAuth,
} from '../../shared/auth/infrastructure';

const phase = process.argv.find((argument) => argument.startsWith('--phase='))?.split('=')[1];
const suffixe = process.env.EDUCSYN_AUTH_TOKEN_CERT_SUFFIX ?? randomUUID();
const utilisateurId = `auth-token-restart-${suffixe}`;
const email = `${utilisateurId}@educsync.test`;
const sessionAId = `session-a-${suffixe}`;
const sessionBId = `session-b-${suffixe}`;
const refreshABrut = `refresh-a-${suffixe}-educsyn`;
const refreshBBrut = `refresh-b-${suffixe}-educsyn`;
const refreshARotation = `refresh-a-rotation-${suffixe}-educsyn`;
const jwt = new JwtTokenAdapter({ secretJwt: 'secret-certification-cycle-jetons-auth-educsyn' });

async function executerPhase(): Promise<void> {
  const pool = creerPoolPostgresAuth();
  const client = new ClientPoolPostgresAuth(pool);
  const utilisateurs = new PostgresUtilisateurAuthRepository(client);
  const refreshTokens = new PostgresRefreshTokenRepository(client);
  const sessions = new PostgresSessionUtilisateurRepository(client);
  const transaction = new AuthTransactionManager(client);
  const cache = new SessionCacheService();
  await new MigrateurPostgresAuth(pool).executerToutes();

  try {
    if (phase === 'write') {
      const utilisateur = UtilisateurAuth.creer({
        idUtilisateur: utilisateurId,
        nomComplet: 'Certification cycle jetons Auth',
        email,
        motDePasseHash: 'scrypt:test:test',
      });
      const tokenA = RefreshToken.creer({
        idUtilisateur: utilisateurId,
        idSessionUtilisateur: sessionAId,
        tokenHash: jwt.hacherRefreshTokenSynchrone(refreshABrut),
        tokenVersionEmise: 1,
      });
      const tokenB = RefreshToken.creer({
        idUtilisateur: utilisateurId,
        idSessionUtilisateur: sessionBId,
        tokenHash: jwt.hacherRefreshTokenSynchrone(refreshBBrut),
        tokenVersionEmise: 1,
      });
      const sessionA = new SessionUtilisateur({
        idSessionUtilisateur: sessionAId,
        idUtilisateur: utilisateurId,
        refreshTokenId: tokenA.obtenirId(),
        deviceId: 'appareil-a',
        estOffline: false,
        creeLe: new Date(),
        version: 1,
      });
      const sessionB = new SessionUtilisateur({
        idSessionUtilisateur: sessionBId,
        idUtilisateur: utilisateurId,
        refreshTokenId: tokenB.obtenirId(),
        deviceId: 'appareil-b',
        estOffline: false,
        creeLe: new Date(),
        version: 1,
      });
      await transaction.executerDansTransaction(async () => {
        await utilisateurs.sauvegarder(utilisateur);
        await refreshTokens.sauvegarder(tokenA);
        await refreshTokens.sauvegarder(tokenB);
        await sessions.sauvegarder(sessionA);
        await sessions.sauvegarder(sessionB);
      });
      return;
    }

    if (phase === 'refresh-logout') {
      const rotation = new RefreshTokenSaga(
        transaction,
        refreshTokens,
        sessions,
        utilisateurs,
        jwt,
        new MoteurRefreshToken({
          genererRefreshTokenValue: () => refreshARotation,
          hacherRefreshToken: (valeur) => jwt.hacherRefreshTokenSynchrone(valeur),
        }),
        cache,
      );
      const resultat = await rotation.executer({ refreshToken: refreshABrut, sessionId: sessionAId });
      assert.equal(resultat.sessionId, sessionAId);
      await new LogoutSaga(transaction, sessions, refreshTokens, cache, { publierAuditSecurite: async () => undefined } as never)
        .executer({ sessionId: sessionAId });
      assert.ok(await sessions.trouverSessionActive(sessionBId));
      return;
    }

    if (phase === 'verify-local') {
      assert.equal(await sessions.trouverSessionActive(sessionAId), null);
      assert.ok(await sessions.trouverSessionActive(sessionBId));
      assert.equal((await refreshTokens.trouverParHash(jwt.hacherRefreshTokenSynchrone(refreshABrut)))?.obtenirRevoque(), true);
      assert.equal((await refreshTokens.trouverParHash(jwt.hacherRefreshTokenSynchrone(refreshBBrut)))?.obtenirRevoque(), false);
      return;
    }

    if (phase === 'global') {
      await new RevoquerToutesSessionsUtilisateurUseCase(transaction, utilisateurs, sessions, refreshTokens)
        .executer({ utilisateurId });
      return;
    }

    assert.equal(await sessions.trouverSessionActive(sessionAId), null);
    assert.equal(await sessions.trouverSessionActive(sessionBId), null);
    assert.equal((await refreshTokens.trouverParHash(jwt.hacherRefreshTokenSynchrone(refreshBBrut)))?.obtenirRevoque(), true);
    assert.equal((await utilisateurs.trouverParId(utilisateurId))?.obtenirTokenVersion().obtenirValeur(), 2);
    await pool.query('DELETE FROM auth_sessions_utilisateurs WHERE id_utilisateur = $1', [utilisateurId]);
    await pool.query('DELETE FROM auth_refresh_tokens WHERE id_utilisateur = $1', [utilisateurId]);
    await pool.query('DELETE FROM auth_utilisateurs WHERE id_utilisateur = $1', [utilisateurId]);
  } finally {
    await pool.end();
  }
}

function certifierMultiProcessus(): void {
  const phases = ['write', 'refresh-logout', 'verify-local', 'global', 'verify-global'];
  for (const phaseCourante of phases) {
    const resultat = spawnSync(process.execPath, [require.resolve('tsx/cli'), __filename, `--phase=${phaseCourante}`], {
      cwd: process.cwd(),
      env: { ...process.env, EDUCSYN_AUTH_TOKEN_CERT_SUFFIX: suffixe },
      encoding: 'utf8',
    });
    if (resultat.status !== 0) {
      throw new Error(resultat.stderr || `La phase ${phaseCourante} a echoue.`);
    }
  }
  process.stdout.write('Cycle JWT, sessions et refresh Auth certifie sur plusieurs redemarrages.\n');
}

if (phase) {
  void executerPhase();
} else {
  certifierMultiProcessus();
}
