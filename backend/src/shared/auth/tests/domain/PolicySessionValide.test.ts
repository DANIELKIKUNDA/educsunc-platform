import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurSessionRevoquee, PolicySessionPersistante } from 'shared/auth/domain';

test('session valide acceptee', () => {
  assert.doesNotThrow(() => PolicySessionPersistante.verifier({}));
});

test('session revoquee refusee', () => {
  assert.throws(() => PolicySessionPersistante.verifier({ revoqueeLe: new Date() }), ErreurSessionRevoquee);
});
