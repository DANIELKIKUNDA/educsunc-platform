import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurRestrictionFinanciere, PolicyLectureFinanciere } from 'shared/security/domain';

test('lecture financiere autorisee sinon refusee', () => {
  PolicyLectureFinanciere.verifier(true);
  assert.throws(() => PolicyLectureFinanciere.verifier(false), ErreurRestrictionFinanciere);
});
