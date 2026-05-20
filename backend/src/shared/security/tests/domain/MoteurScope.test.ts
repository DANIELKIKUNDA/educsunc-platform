import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurEcoleNonAutorisee, ErreurOrganisationNonAutorisee, MoteurScope } from 'shared/security/domain';

test('moteur scope verifie organisation, ecole et refuse hors scope', () => {
  const moteur = new MoteurScope();
  moteur.verifierOrganisation(['org-1'], 'org-1');
  moteur.verifierEcole(['ecole-1'], 'ecole-1');
  assert.throws(() => moteur.verifierOrganisation(['org-1'], 'org-9'), ErreurOrganisationNonAutorisee);
  assert.throws(() => moteur.verifierEcole(['ecole-1'], 'ecole-9'), ErreurEcoleNonAutorisee);
});
