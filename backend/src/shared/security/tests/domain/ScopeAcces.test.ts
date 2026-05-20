import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurEcoleNonAutorisee, ErreurOrganisationNonAutorisee, MoteurScope, ScopeAcces, TypeScope } from 'shared/security/domain';

test('doit creer scope organisation et scope ecole', () => {
  const scopeOrganisation = ScopeAcces.creer(new TypeScope('ORGANISATION'), 'org-1');
  const scopeEcole = ScopeAcces.creer(new TypeScope('ECOLE'), 'ecole-1', true);

  assert.equal(scopeOrganisation.obtenirTypeScope().obtenirValeur(), 'ORGANISATION');
  assert.equal(scopeEcole.obtenirTypeScope().obtenirValeur(), 'ECOLE');
  assert.equal(scopeEcole.obtenirEstLectureSeule(), true);
});

test('doit verifier portee organisation et ecole puis refuser hors scope', () => {
  const moteur = new MoteurScope();
  moteur.verifierOrganisation(['org-1'], 'org-1');
  moteur.verifierEcole(['ecole-1'], 'ecole-1');

  assert.throws(() => moteur.verifierOrganisation(['org-1'], 'org-2'), ErreurOrganisationNonAutorisee);
  assert.throws(() => moteur.verifierEcole(['ecole-1'], 'ecole-2'), ErreurEcoleNonAutorisee);
});
