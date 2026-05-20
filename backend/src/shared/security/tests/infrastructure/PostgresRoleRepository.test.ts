import test from 'node:test';
import assert from 'node:assert/strict';
import { PostgresRoleRepository } from 'shared/security/infrastructure';
import { creerRole, reinitialiserMemoireSecurity } from '../support/SecurityTestSupport';

test('save role, update role, recherche role et permissions', async () => {
  reinitialiserMemoireSecurity();
  const repository = new PostgresRoleRepository();
  const role = creerRole({ permissions: ['bulletins.read'] });
  await repository.sauvegarder(role);

  let trouve = await repository.trouverParCode('ENSEIGNANT');
  assert.ok(trouve);
  assert.equal(trouve?.obtenirPermissions().length, 1);

  role.ajouterPermission('cotes.write');
  await repository.sauvegarder(role);
  trouve = await repository.trouverParId(role.obtenirId());
  assert.equal(trouve?.obtenirPermissions().length, 2);
});
