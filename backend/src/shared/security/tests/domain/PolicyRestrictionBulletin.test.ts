import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurRestrictionBulletin, PolicyBulletinConditionPaiement } from 'shared/security/domain';

test('acces bulletin autorise sinon interdit', () => {
  PolicyBulletinConditionPaiement.verifier(true);
  assert.throws(() => PolicyBulletinConditionPaiement.verifier(false), ErreurRestrictionBulletin);
});
