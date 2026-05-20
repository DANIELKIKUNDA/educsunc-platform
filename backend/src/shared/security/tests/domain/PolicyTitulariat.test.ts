import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurClasseDejaTitulaire, PolicyTitulariatClasse } from 'shared/security/domain';

test('titulaire valide accepte et non disponibilite refusee', () => {
  PolicyTitulariatClasse.verifier(false);
  assert.throws(() => PolicyTitulariatClasse.verifier(true), ErreurClasseDejaTitulaire);
});
