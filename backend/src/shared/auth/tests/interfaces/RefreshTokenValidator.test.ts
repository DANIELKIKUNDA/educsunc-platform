import test from 'node:test';
import assert from 'node:assert/strict';
import { RefreshTokenValidator } from 'shared/auth/interfaces/http/validators/RefreshTokenValidator';

test('refresh token obligatoire et refresh token vide refuse', () => {
  assert.throws(() => RefreshTokenValidator.valider({}, {}));
  assert.throws(() => RefreshTokenValidator.valider({ refreshToken: '' }, {}));
});
