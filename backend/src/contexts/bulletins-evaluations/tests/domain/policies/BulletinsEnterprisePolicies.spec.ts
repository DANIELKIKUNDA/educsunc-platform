import test from 'node:test';
import assert from 'node:assert/strict';
import { PolicyColonneProclameeVerrouillee } from 'contexts/bulletins-evaluations/domain/policies/PolicyColonneProclameeVerrouillee';
import { EtatProclamation } from 'contexts/bulletins-evaluations/domain/value-objects/EtatProclamation';

// Ce fichier couvre les nouvelles policies enterprise du domaine.
test('la policy bloque une modification normale si la colonne est verrouillee', () => {
  const policy = new PolicyColonneProclameeVerrouillee();

  assert.throws(() =>
    policy.verifier(true, EtatProclamation.VERROUILLEE, 'Correction', true));
});

test('la policy exige un motif sur une colonne deja proclamee', () => {
  const policy = new PolicyColonneProclameeVerrouillee();

  assert.throws(() =>
    policy.verifier(true, EtatProclamation.VALIDEE, undefined, true));
});

test('la policy autorise une modification controlee avant verrouillage', () => {
  const policy = new PolicyColonneProclameeVerrouillee();

  assert.doesNotThrow(() =>
    policy.verifier(true, EtatProclamation.GENEREE, 'Correction motivee', true));
});
