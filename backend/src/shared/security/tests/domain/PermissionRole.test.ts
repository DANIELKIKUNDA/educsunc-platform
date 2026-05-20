import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurPermissionDupliquee, ErreurRoleSystemeNonModifiable } from 'shared/security/domain';
import { creerRole } from '../support/SecurityTestSupport';

test('doit associer permission a role, empecher duplication et verifier permission existante', () => {
  const role = creerRole({ permissions: ['cotes.write'] });
  role.ajouterPermission('bulletins.read');

  assert.equal(role.obtenirPermissions().length, 2);
  role.verifierPermission('bulletins.read');
  assert.throws(() => role.ajouterPermission('bulletins.read'), ErreurPermissionDupliquee);
});

test('doit retirer permission d un role standard', () => {
  const role = creerRole({ permissions: ['cotes.write', 'bulletins.read'] });
  role.retirerPermission('bulletins.read');

  assert.equal(role.obtenirPermissions().length, 1);
  assert.equal(role.obtenirPermissions()[0]?.obtenirPermission().obtenirValeur(), 'cotes.write');
});

test('doit proteger les permissions critiques d un role systeme', () => {
  const role = creerRole({ codeRole: 'MANAGER_SYSTEME', niveauAcces: 'PLATEFORME', estSysteme: true, permissions: ['permissions.read', 'roles.write'] });

  assert.throws(() => role.retirerPermission('roles.write'), ErreurRoleSystemeNonModifiable);
});
