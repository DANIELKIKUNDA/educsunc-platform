import test from 'node:test';
import assert from 'node:assert/strict';
import { SessionMiddleware } from 'shared/auth/interfaces/http/middlewares/SessionMiddleware';
import { SessionValidationMiddleware } from 'shared/auth/infrastructure/middlewares/SessionValidationMiddleware';
import { SessionApplicationService } from 'shared/auth/application/services/SessionApplicationService';
import { SessionCachePortMemoire, creerRepositoriesMemoire, creerSessionUtilisateur } from '../support/AuthTestSupport';

test('session valide acceptee et session revoquee refusee', async () => {
  const repositories = creerRepositoriesMemoire();
  const session = creerSessionUtilisateur();
  await repositories.depotSessionUtilisateur.sauvegarder(session);
  const cache = new SessionCachePortMemoire();
  const middleware = new SessionMiddleware(
    new SessionValidationMiddleware(
      new SessionApplicationService(repositories.depotSessionUtilisateur, repositories.depotRefreshToken, cache),
    ),
  );

  assert.equal(await middleware.verifierSession({ 'x-session-id': session.obtenirId() }), session.obtenirId());
  session.revoquer('logout');
  await repositories.depotSessionUtilisateur.sauvegarder(session);
  await cache.invaliderSession(session.obtenirId());
  await assert.rejects(() => middleware.verifierSession({ 'x-session-id': session.obtenirId() }));
});
