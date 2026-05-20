import test from 'node:test';
import assert from 'node:assert/strict';
import { PostgresRefreshTokenRepository } from 'shared/auth/infrastructure/persistence/postgres/repositories/PostgresRefreshTokenRepository';
import { creerRefreshToken, reinitialiserMemoireAuth } from '../support/AuthTestSupport';

test('save refresh token, revoke refresh token et rotation logique', async () => {
  reinitialiserMemoireAuth();
  const repository = new PostgresRefreshTokenRepository();
  const refreshToken = creerRefreshToken('user-1', 'hash-1');
  await repository.sauvegarder(refreshToken);

  const trouve = await repository.trouverParHash('hash-1');
  assert.ok(trouve);

  await repository.revoquer(refreshToken.obtenirId());
  const revoque = await repository.trouverParHash('hash-1');
  assert.equal(revoque?.obtenirRevoque(), true);
});
