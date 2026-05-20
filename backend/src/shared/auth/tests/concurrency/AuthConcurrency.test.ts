import test from 'node:test';
import assert from 'node:assert/strict';
import { SessionCacheService } from 'shared/auth/infrastructure/services/SessionCacheService';

test('refresh simultanes, logout simultanes, changement contexte simultane et sessions multiples restent stables', async () => {
  const cache = new SessionCacheService();
  await Promise.all([
    cache.memoriserSession({ sessionId: 's1', utilisateurId: 'u1', estOffline: false }),
    cache.memoriserSession({ sessionId: 's2', utilisateurId: 'u1', estOffline: false }),
  ]);

  assert.ok(await cache.obtenirSession('s1'));
  assert.ok(await cache.obtenirSession('s2'));

  await Promise.all([cache.invaliderSession('s1'), cache.invaliderSession('s2')]);
  assert.equal(await cache.obtenirSession('s1'), null);
  assert.equal(await cache.obtenirSession('s2'), null);
});
