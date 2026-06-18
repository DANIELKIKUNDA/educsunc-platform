import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ErreurEcoleNonAutorisee,
  ErreurOrganisationNonAutorisee,
  ErreurSectionNonAutorisee,
  MoteurScope,
} from 'shared/security/domain';

test('moteur scope verifie organisation, ecole, section et refuse hors scope', () => {
  const moteur = new MoteurScope();
  moteur.verifierOrganisation(['org-1'], 'org-1');
  moteur.verifierEcole(['ecole-1'], 'ecole-1');
  moteur.verifierSection(['section-sec'], 'section-sec');
  assert.throws(() => moteur.verifierOrganisation(['org-1'], 'org-9'), ErreurOrganisationNonAutorisee);
  assert.throws(() => moteur.verifierEcole(['ecole-1'], 'ecole-9'), ErreurEcoleNonAutorisee);
  assert.throws(() => moteur.verifierSection(['section-sec'], 'section-pri'), ErreurSectionNonAutorisee);
});
