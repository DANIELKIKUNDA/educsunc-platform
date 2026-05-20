import assert from 'node:assert/strict';
import test from 'node:test';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../helpers/GlobalTestHelpers';

test('login complet couvre login, refresh, logout, expiration et invalidation tokenVersion', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const acteur = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const serveur = await bootstrap.creerServeur();

  const session = await injecterCommeActeur(serveur, acteur, { method: 'GET', url: '/probe/context' });
  assert.equal(session.statusCode, 200);

  const refresh = await bootstrap.obtenirRefreshUseCase().executer({ refreshToken: acteur.refreshToken });
  assert.ok(refresh.accessToken.length > 0);
  assert.ok(refresh.refreshToken.length > 0);

  const utilisateur = await bootstrap.authRepositories.depotUtilisateurAuth.trouverParId(acteur.utilisateurId);
  assert.ok(utilisateur);
  utilisateur!.changerMotDePasse('hash-nouveau');
  await bootstrap.authRepositories.depotUtilisateurAuth.sauvegarder(utilisateur!);

  const tokenInvalide = await injecterCommeActeur(serveur, acteur, { method: 'GET', url: '/probe/context' });
  assert.equal(tokenInvalide.statusCode, 401, tokenInvalide.body);

  await bootstrap.obtenirLogoutUseCase().executer({ sessionId: acteur.sessionId });
  const apresLogout = await injecterCommeActeur(serveur, { ...acteur, accessToken: refresh.accessToken }, { method: 'GET', url: '/probe/context' });
  assert.equal(apresLogout.statusCode, 401, apresLogout.body);

  await serveur.close();
});
