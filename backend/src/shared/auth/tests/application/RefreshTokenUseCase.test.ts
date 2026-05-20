import test from 'node:test';
import assert from 'node:assert/strict';
import { AuthApplicationService } from 'shared/auth/application/services/AuthApplicationService';
import { RefreshTokenUseCase } from 'shared/auth/application/use-cases/RefreshTokenUseCase';
import { RefreshTokenSaga } from 'shared/auth/application/sagas/RefreshTokenSaga';
import { MoteurRefreshToken } from 'shared/auth/domain/services/MoteurRefreshToken';
import { JwtTokenAdapter } from 'shared/auth/infrastructure/adapters/jwt/JwtTokenAdapter';
import { creerRefreshToken, creerRepositoriesMemoire, creerUtilisateurAuth, reinitialiserMemoireAuth, TransactionManagerMemoire } from '../support/AuthTestSupport';

test('refresh valide fait une rotation et retourne de nouveaux tokens', async () => {
  reinitialiserMemoireAuth();
  const repositories = creerRepositoriesMemoire();
  const jwt = new JwtTokenAdapter('test-secret');
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
  const useCase = new RefreshTokenUseCase(new AuthApplicationService({ executer: async () => ({}) } as never, { executer: async () => undefined } as never, saga, { executer: async () => undefined } as never));

  const resultat = await useCase.executer({ refreshToken: brut });
  assert.ok(resultat.accessToken.length > 0);
  assert.equal(resultat.refreshToken, 'refresh-nouveau');
});

test('refresh expire ou revoque est rejete', async () => {
  const repositories = creerRepositoriesMemoire();
  const jwt = new JwtTokenAdapter('test-secret');
  const utilisateur = creerUtilisateurAuth({ email: 'refresh@test.cd' });
  await repositories.depotUtilisateurAuth.sauvegarder(utilisateur);
  const brut = 'refresh-expire';
  const hash = await jwt.hacherRefreshToken(brut);
  const expire = creerRefreshToken(utilisateur.obtenirId(), hash, new Date(Date.now() - 1000));
  await repositories.depotRefreshToken.sauvegarder(expire);

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

  await assert.rejects(() => saga.executer({ refreshToken: brut }));
});
