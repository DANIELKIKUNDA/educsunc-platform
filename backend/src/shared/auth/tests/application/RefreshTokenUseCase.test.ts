import test from 'node:test';
import assert from 'node:assert/strict';
import { AuthApplicationService } from 'shared/auth/application/services/AuthApplicationService';
import { RefreshTokenUseCase } from 'shared/auth/application/use-cases/RefreshTokenUseCase';
import { RefreshTokenSaga } from 'shared/auth/application/sagas/RefreshTokenSaga';
import { MoteurRefreshToken } from 'shared/auth/domain/services/MoteurRefreshToken';
import { JwtTokenAdapter } from 'shared/auth/infrastructure/adapters/jwt/JwtTokenAdapter';
import { creerRefreshToken, creerRepositoriesMemoire, creerSessionUtilisateur, creerUtilisateurAuth, reinitialiserMemoireAuth, SessionCachePortMemoire, TransactionManagerMemoire } from '../support/AuthTestSupport';

test('refresh valide fait une rotation et retourne de nouveaux tokens', async () => {
  reinitialiserMemoireAuth();
  const repositories = creerRepositoriesMemoire();
  const jwt = new JwtTokenAdapter('test-secret');
  const utilisateur = creerUtilisateurAuth();
  await repositories.depotUtilisateurAuth.sauvegarder(utilisateur);
  const brut = 'refresh-source';
  const hash = await jwt.hacherRefreshToken(brut);
  const token = creerRefreshToken(utilisateur.obtenirId(), hash);
  const session = creerSessionUtilisateur({ idUtilisateur: utilisateur.obtenirId(), refreshTokenId: token.obtenirId() });
  token.associerSession(session.obtenirId());
  await repositories.depotRefreshToken.sauvegarder(token);
  await repositories.depotSessionUtilisateur.sauvegarder(session);

  const saga = new RefreshTokenSaga(
    new TransactionManagerMemoire(),
    repositories.depotRefreshToken,
    repositories.depotSessionUtilisateur,
    repositories.depotUtilisateurAuth,
    jwt,
    new MoteurRefreshToken({
      genererRefreshTokenValue: () => 'refresh-nouveau',
      hacherRefreshToken: (valeur) => `hash:${valeur}`,
    }),
    new SessionCachePortMemoire(),
  );
  const useCase = new RefreshTokenUseCase(new AuthApplicationService({ executer: async () => ({}) } as never, { executer: async () => undefined } as never, saga, { executer: async () => undefined } as never));

  const resultat = await useCase.executer({ refreshToken: brut, sessionId: session.obtenirId() });
  assert.ok(resultat.accessToken.length > 0);
  assert.equal(resultat.refreshToken, 'refresh-nouveau');
});

test('refresh revoque est rejete', async () => {
  const repositories = creerRepositoriesMemoire();
  const jwt = new JwtTokenAdapter('test-secret');
  const utilisateur = creerUtilisateurAuth({ email: 'refresh@test.cd' });
  await repositories.depotUtilisateurAuth.sauvegarder(utilisateur);
  const brut = 'refresh-revoque';
  const hash = await jwt.hacherRefreshToken(brut);
  const revoque = creerRefreshToken(utilisateur.obtenirId(), hash);
  const session = creerSessionUtilisateur({ idUtilisateur: utilisateur.obtenirId(), refreshTokenId: revoque.obtenirId() });
  revoque.associerSession(session.obtenirId());
  revoque.revoquer();
  await repositories.depotRefreshToken.sauvegarder(revoque);
  await repositories.depotSessionUtilisateur.sauvegarder(session);

  const saga = new RefreshTokenSaga(
    new TransactionManagerMemoire(),
    repositories.depotRefreshToken,
    repositories.depotSessionUtilisateur,
    repositories.depotUtilisateurAuth,
    jwt,
    new MoteurRefreshToken({
      genererRefreshTokenValue: () => 'refresh-nouveau',
      hacherRefreshToken: (valeur) => `hash:${valeur}`,
    }),
    new SessionCachePortMemoire(),
  );

  await assert.rejects(() => saga.executer({ refreshToken: brut, sessionId: session.obtenirId() }));
});
