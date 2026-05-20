import test from 'node:test';
import assert from 'node:assert/strict';
import { PermissionCacheService } from 'shared/security/infrastructure';

test('cache permissions, invalidate permissions et refresh permissions', async () => {
  const service = new PermissionCacheService();
  await service.memoriserPermissions('u1', ['bulletins.read']);
  assert.deepEqual(await service.obtenirPermissions('u1'), ['bulletins.read']);

  await service.memoriserPermissions('u1', ['bulletins.read', 'cotes.write']);
  assert.deepEqual(await service.obtenirPermissions('u1'), ['bulletins.read', 'cotes.write']);

  await service.invaliderPermissions('u1');
  assert.equal(await service.obtenirPermissions('u1'), null);
});
