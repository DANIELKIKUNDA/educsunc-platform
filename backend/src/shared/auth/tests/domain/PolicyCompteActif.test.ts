import test from 'node:test';
import assert from 'node:assert/strict';
import { EtatCompteUtilisateur, ErreurCompteDesactive, ErreurCompteSuspendu, PolicyCompteActif } from 'shared/auth/domain';

test('ACTIVE accepte', () => {
  assert.doesNotThrow(() => PolicyCompteActif.verifier(EtatCompteUtilisateur.ACTIVE));
});

test('SUSPENDED refuse', () => {
  assert.throws(() => PolicyCompteActif.verifier(EtatCompteUtilisateur.SUSPENDED), ErreurCompteSuspendu);
});

test('DISABLED refuse', () => {
  assert.throws(() => PolicyCompteActif.verifier(EtatCompteUtilisateur.DISABLED), ErreurCompteDesactive);
});
