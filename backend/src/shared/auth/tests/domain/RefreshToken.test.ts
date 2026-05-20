import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurRefreshTokenExpire, ErreurRefreshTokenRevoque } from 'shared/auth/domain';
import { creerRefreshToken } from '../support/AuthTestSupport';

test('doit generer un refresh token avec hash, utilisateur et expiration', () => {
  const refreshToken = creerRefreshToken('utilisateur-1', 'hash-1');

  assert.ok(refreshToken.obtenirId());
  assert.equal(refreshToken.obtenirIdUtilisateur(), 'utilisateur-1');
  assert.equal(refreshToken.obtenirTokenHash(), 'hash-1');
  assert.ok(refreshToken.obtenirExpireLe() instanceof Date);
});

test('doit revoquer le refresh token et empecher sa reutilisation', () => {
  const refreshToken = creerRefreshToken('utilisateur-1', 'hash-1');
  refreshToken.revoquer();

  assert.equal(refreshToken.obtenirRevoque(), true);
  assert.throws(() => refreshToken.verifierExpiration(), ErreurRefreshTokenRevoque);
});

test('doit rejeter un refresh token expire', () => {
  const refreshToken = creerRefreshToken('utilisateur-1', 'hash-1', new Date(Date.now() - 1000));
  assert.throws(() => refreshToken.verifierExpiration(), ErreurRefreshTokenExpire);
});
