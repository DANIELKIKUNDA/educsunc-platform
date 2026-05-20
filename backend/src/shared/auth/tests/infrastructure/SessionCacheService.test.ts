import test from 'node:test';
import assert from 'node:assert/strict';
import { SessionCacheService } from 'shared/auth/infrastructure/services/SessionCacheService';

test('cache session, invalidate cache, refresh cache et cache offline auth', async () => {
  const service = new SessionCacheService();
  await service.memoriserSession({ sessionId: 's1', utilisateurId: 'u1', estOffline: false });
  assert.equal((await service.obtenirSession('s1'))?.utilisateurId, 'u1');

  await service.memoriserSession({ sessionId: 's1', utilisateurId: 'u2', estOffline: true });
  assert.equal((await service.obtenirSession('s1'))?.utilisateurId, 'u2');

  await service.memoriserAuthOffline('u1', { deviceId: 'd1' });
  assert.deepEqual(await service.obtenirAuthOffline('u1'), { deviceId: 'd1' });

  await service.invaliderSession('s1');
  assert.equal(await service.obtenirSession('s1'), null);
});
