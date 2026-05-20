import test from 'node:test';
import assert from 'node:assert/strict';
import { RefreshTokenSaga } from 'shared/auth/application/sagas/RefreshTokenSaga';
import { MoteurRefreshToken } from 'shared/auth/domain/services/MoteurRefreshToken';
import { JwtTokenAdapter } from 'shared/auth/infrastructure/adapters/jwt/JwtTokenAdapter';
import { TransactionManagerMemoire, creerRefreshToken, creerRepositoriesMemoire, creerUtilisateurAuth } from '../support/AuthTestSupport';

test('rotation complete refresh token avec nouveau JWT', async () => {
  const repositories = creerRepositoriesMemoire();
  const jwt = new JwtTokenAdapter('secret-test');
  const utilisateur = creerUtilisateurAuth();
  await repositories.depotUtilisateurAuth.sauvegarder(utilisateur);
  const brut = 'refresh-source';
  const hash = await jwt.hacherRefreshToken(brut);
  await repositories.depotRefreshToken.sauvegarder(creerRefreshToken(utilisateur.obtenirId(), hash));

  const saga = new RefreshTokenSaga(
    new TransactionManagerMemoire(),
    repositories.depotRefreshToken,
    repositories.depotUtilisateurAuth,
    jwt,
    new MoteurRefreshToken({
      genererRefreshTokenValue: () => 'refresh-nouveau',
      hacherRefreshToken: (valeur) => `hash:${valeur}`,
    }),
  );

  const resultat = await saga.executer({ refreshToken: brut });
  assert.ok(resultat.accessToken.length > 0);
  assert.equal(resultat.refreshToken, 'refresh-nouveau');
});
