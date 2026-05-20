import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurRefreshTokenInvalide, PolicyRefreshTokenUnique } from 'shared/auth/domain';

test('refresh token valide accepte', () => {
  assert.doesNotThrow(() => PolicyRefreshTokenUnique.verifier(false));
});

test('refresh token collision refusee', () => {
  assert.throws(() => PolicyRefreshTokenUnique.verifier(true), ErreurRefreshTokenInvalide);
});
