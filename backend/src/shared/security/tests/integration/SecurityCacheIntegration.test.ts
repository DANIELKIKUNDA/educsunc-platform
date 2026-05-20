import test from 'node:test';
import assert from 'node:assert/strict';
import { PermissionCacheService } from 'shared/security/infrastructure';

test('cache permissions, invalidation cache et propagation permissions restent coherents', async () => {
  const cache = new PermissionCacheService();
  await cache.memoriserPermissions('u1', ['bulletins.read']);
  await cache.memoriserPermissions('u1', ['bulletins.read', 'cotes.write']);

  assert.deepEqual(await cache.obtenirPermissions('u1'), ['bulletins.read', 'cotes.write']);
  await cache.invaliderPermissions('u1');
  assert.equal(await cache.obtenirPermissions('u1'), null);
});
