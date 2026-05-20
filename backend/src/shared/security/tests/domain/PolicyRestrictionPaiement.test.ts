import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurRestrictionCaisse, PolicyPerceptionFrais } from 'shared/security/domain';

test('acces paiement autorise sinon interdit', () => {
  PolicyPerceptionFrais.verifier(true);
  assert.throws(() => PolicyPerceptionFrais.verifier(false), ErreurRestrictionCaisse);
});
