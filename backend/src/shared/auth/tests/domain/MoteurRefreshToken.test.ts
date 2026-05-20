import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurRefreshTokenRevoque, MoteurRefreshToken } from 'shared/auth/domain';

const moteur = new MoteurRefreshToken({
  genererRefreshTokenValue: () => 'refresh-brut',
  hacherRefreshToken: (valeur) => `hash:${valeur}`,
  calculerExpirationRefreshToken: () => new Date(Date.now() + 60_000),
});

test('generation refresh token', () => {
  const resultat = moteur.generer('utilisateur-1');
  assert.equal(resultat.refreshTokenValue.obtenirValeur(), 'refresh-brut');
  assert.equal(resultat.refreshToken.obtenirTokenHash(), 'hash:refresh-brut');
});

test('rotation refresh token', () => {
  const ancien = moteur.generer('utilisateur-1').refreshToken;
  moteur.revoquer(ancien);
  const nouveau = moteur.generer('utilisateur-1').refreshToken;
  assert.notEqual(ancien.obtenirId(), nouveau.obtenirId());
});

test('revocation refresh token', () => {
  const refreshToken = moteur.generer('utilisateur-1').refreshToken;
  moteur.revoquer(refreshToken);
  assert.throws(() => moteur.verifier(refreshToken), ErreurRefreshTokenRevoque);
});
