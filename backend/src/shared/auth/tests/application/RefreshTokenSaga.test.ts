import test from 'node:test';
import assert from 'node:assert/strict';
import { RefreshTokenSaga } from 'shared/auth/application/sagas/RefreshTokenSaga';
import { MoteurRefreshToken } from 'shared/auth/domain/services/MoteurRefreshToken';
import { JwtTokenAdapter } from 'shared/auth/infrastructure/adapters/jwt/JwtTokenAdapter';
import { SessionCachePortMemoire, TransactionManagerMemoire, creerRefreshToken, creerRepositoriesMemoire, creerSessionUtilisateur, creerUtilisateurAuth } from '../support/AuthTestSupport';

test('rotation complete refresh token avec nouveau JWT', async () => {
  const repositories = creerRepositoriesMemoire();
  const jwt = new JwtTokenAdapter('secret-test');
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

  const resultat = await saga.executer({ refreshToken: brut, sessionId: session.obtenirId() });
  assert.ok(resultat.accessToken.length > 0);
  assert.equal(resultat.refreshToken, 'refresh-nouveau');
});
