import test from 'node:test';
import assert from 'node:assert/strict';
import { MoteurAutorisation, PermissionRole, PermissionSecurite } from 'shared/security/domain';

test('moteur autorisation gere permission presente, absente et scope invalide', () => {
  const moteur = new MoteurAutorisation();
  const permissions = [PermissionRole.creer(new PermissionSecurite('roles.read'))];

  assert.equal(moteur.verifierPermission(permissions, [], 'roles.read', true).decision.estAutorise(), true);
  assert.equal(moteur.verifierPermission([], [], 'roles.read', true).decision.estAutorise(), false);
  assert.equal(moteur.verifierPermission(permissions, [], 'roles.read', false).decision.estAutorise(), false);
});
