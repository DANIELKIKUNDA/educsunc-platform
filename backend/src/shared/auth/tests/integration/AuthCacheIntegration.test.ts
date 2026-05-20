import test from 'node:test';
import assert from 'node:assert/strict';
import { SessionApplicationService } from 'shared/auth/application/services/SessionApplicationService';
import { SessionCacheService } from 'shared/auth/infrastructure/services/SessionCacheService';
import { creerRepositoriesMemoire, creerSessionUtilisateur } from '../support/AuthTestSupport';

test('cache session, invalidation session et cache refresh token', async () => {
  const repositories = creerRepositoriesMemoire();
  const cache = new SessionCacheService();
  const session = creerSessionUtilisateur();
  await repositories.depotSessionUtilisateur.sauvegarder(session);
  const service = new SessionApplicationService(repositories.depotSessionUtilisateur, repositories.depotRefreshToken, cache);

  const sortie = await service.obtenirSessionActive(session.obtenirId());
  assert.equal((await cache.obtenirSession(session.obtenirId()))?.sessionId, sortie.sessionId);

  await service.revoquerSession(session.obtenirId());
  assert.equal(await cache.obtenirSession(session.obtenirId()), null);
});
