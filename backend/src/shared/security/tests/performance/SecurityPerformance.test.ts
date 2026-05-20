import test from 'node:test';
import assert from 'node:assert/strict';
import { PermissionCacheService } from 'shared/security/infrastructure';

test('1000 verifications permissions et cache haute charge restent stables', async () => {
  const cache = new PermissionCacheService();
  await cache.memoriserPermissions('u1', ['security.read', 'bulletins.read', 'cotes.write']);

  for (let index = 0; index < 1000; index += 1) {
    const permissions = await cache.obtenirPermissions('u1');
    assert.equal(Array.isArray(permissions), true);
  }
});
