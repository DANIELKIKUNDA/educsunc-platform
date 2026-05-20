import test from 'node:test';
import assert from 'node:assert/strict';
import { CodeRestrictionMetier, ErreurRestrictionBulletin, ErreurRestrictionCaisse, MoteurRestrictionsMetier, RestrictionRole } from 'shared/security/domain';

test('moteur restrictions applique restrictions metier transverses', () => {
  const moteur = new MoteurRestrictionsMetier();
  const restrictionCaisse = [RestrictionRole.creer(new CodeRestrictionMetier('INTERDICTION_CAISSE'))];
  const restrictionBulletin = [RestrictionRole.creer(new CodeRestrictionMetier('INTERDICTION_BULLETINS'))];

  assert.throws(() => moteur.verifierCaisse(restrictionCaisse), ErreurRestrictionCaisse);
  assert.throws(() => moteur.verifierBulletins(restrictionBulletin), ErreurRestrictionBulletin);
});
