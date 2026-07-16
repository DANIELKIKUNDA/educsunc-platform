import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurRefreshTokenRevoque } from 'shared/auth/domain';
import { creerRefreshToken } from '../support/AuthTestSupport';

test('doit generer un refresh token persistant avec hash, utilisateur et version de securite', () => {
  const refreshToken = creerRefreshToken('utilisateur-1', 'hash-1');

  assert.ok(refreshToken.obtenirId());
  assert.equal(refreshToken.obtenirIdUtilisateur(), 'utilisateur-1');
  assert.equal(refreshToken.obtenirTokenHash(), 'hash-1');
  assert.equal(refreshToken.obtenirTokenVersionEmise(), 1);
});

test('doit revoquer le refresh token et empecher sa reutilisation', () => {
  const refreshToken = creerRefreshToken('utilisateur-1', 'hash-1');
  refreshToken.revoquer();

  assert.equal(refreshToken.obtenirRevoque(), true);
  assert.throws(() => refreshToken.verifierValidite(), ErreurRefreshTokenRevoque);
});

test('doit rester valide sans echeance tant qu il n est pas revoque', () => {
  const refreshToken = creerRefreshToken('utilisateur-1', 'hash-1');
  assert.doesNotThrow(() => refreshToken.verifierValidite());
});
