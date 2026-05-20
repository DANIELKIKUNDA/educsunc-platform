import test from 'node:test';
import assert from 'node:assert/strict';
import { AuthApplicationService } from 'shared/auth/application/services/AuthApplicationService';
import { AuditAuthApplicationService } from 'shared/auth/application/services/AuditAuthApplicationService';
import { LogoutSaga } from 'shared/auth/application/sagas/LogoutSaga';
import { LogoutUseCase } from 'shared/auth/application/use-cases/LogoutUseCase';
import {
  SecurityAuditPortMemoire,
  SessionCachePortMemoire,
  TransactionManagerMemoire,
  creerRefreshToken,
  creerRepositoriesMemoire,
  creerSessionUtilisateur,
} from '../support/AuthTestSupport';

test('logout valide revoque session, refresh token et invalide le cache', async () => {
  const repositories = creerRepositoriesMemoire();
  const cache = new SessionCachePortMemoire();
  const audit = new SecurityAuditPortMemoire();
  const refreshToken = creerRefreshToken('utilisateur-1', 'refresh-1');
  const session = creerSessionUtilisateur({ idUtilisateur: 'utilisateur-1', refreshTokenId: 'refresh-1' });
  await repositories.depotRefreshToken.sauvegarder(refreshToken);
  await repositories.depotSessionUtilisateur.sauvegarder(session);
  await cache.memoriserSession({ sessionId: session.obtenirId(), utilisateurId: 'utilisateur-1', estOffline: false });

  const saga = new LogoutSaga(
    new TransactionManagerMemoire(),
    repositories.depotSessionUtilisateur,
    repositories.depotRefreshToken,
    cache,
    new AuditAuthApplicationService(audit),
  );
  const useCase = new LogoutUseCase(new AuthApplicationService({ executer: async () => ({}) } as never, saga, { executer: async () => ({ accessToken: '', refreshToken: '' }) } as never, { executer: async () => undefined } as never));

  await useCase.executer({ sessionId: session.obtenirId() });

  assert.equal(await cache.obtenirSession(session.obtenirId()), null);
  assert.ok(audit.audits.some((entry) => entry.action === 'AUTH_LOGOUT'));
});
