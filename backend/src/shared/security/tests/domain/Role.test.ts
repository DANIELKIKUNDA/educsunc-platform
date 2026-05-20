import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurRoleInactif } from 'shared/security/domain';
import { creerRole } from '../support/SecurityTestSupport';

test('doit creer role valide avec code officiel, niveau acces et permissions par defaut', () => {
  const role = creerRole({ codeRole: 'ENSEIGNANT', niveauAcces: 'ECOLE', permissions: ['cotes.write', 'bulletins.read'] });

  assert.equal(role.obtenirCodeRole().obtenirValeur(), 'ENSEIGNANT');
  assert.equal(role.obtenirNiveauAcces().obtenirValeur(), 'ECOLE');
  assert.equal(role.obtenirPermissions().length, 2);
});

test('doit enregistrer des restrictions metier sur un role', () => {
  const role = creerRole();
  role.ajouterRestriction('INTERDICTION_CAISSE', 'Pas d acces caisse');

  assert.equal(role.obtenirRestrictions().length, 1);
  assert.equal(role.obtenirRestrictions()[0]?.obtenirCodeRestriction().obtenirValeur(), 'INTERDICTION_CAISSE');
});

test('refuse code role vide ou niveau acces invalide', () => {
  assert.throws(() => creerRole({ codeRole: '' }));
  assert.throws(() => creerRole({ niveauAcces: 'CLASSE' }));
});

test('doit activer, desactiver et bloquer la verification de permission d un role desactive', () => {
  const role = creerRole();
  role.desactiver();
  assert.equal(role.obtenirEstActif(), false);
  assert.throws(() => role.verifierPermission('cotes.write'), ErreurRoleInactif);

  role.activer();
  assert.equal(role.obtenirEstActif(), true);
});
