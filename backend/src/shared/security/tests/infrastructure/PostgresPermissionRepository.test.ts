import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoirePermissionTestRepository, MemoireRoleTestRepository } from '../support/SecurityMemoryTestRepositories';
import { creerRole, reinitialiserMemoireSecurity } from '../support/SecurityTestSupport';

test('save permission, recherche permission et suppression permission via role', async () => {
  reinitialiserMemoireSecurity();
  const roleRepository = new MemoireRoleTestRepository();
  const permissionRepository = new MemoirePermissionTestRepository();
  const role = creerRole({ permissions: ['bulletins.read', 'cotes.write'] });
  await roleRepository.sauvegarder(role);

  assert.equal((await permissionRepository.listerPermissionsRole('ENSEIGNANT')).length, 2);
  role.retirerPermission('cotes.write');
  await roleRepository.sauvegarder(role);
  assert.deepEqual(await permissionRepository.listerPermissionsRole('ENSEIGNANT'), ['bulletins.read']);
});
