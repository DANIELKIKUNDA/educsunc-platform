import assert from 'node:assert/strict';
import test from 'node:test';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../helpers/GlobalTestHelpers';

test('sessions valides, logout et multi-device restent coherents', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const acteur = await bootstrap.creerActeur({ ...ROLE_FIXTURES.ADMIN_ECOLE, organisationId: TENANT_FIXTURES.organisationA, ecoleId: TENANT_FIXTURES.ecoleA1 });
  const utilisateur = await bootstrap.authRepositories.depotUtilisateurAuth.trouverParId(acteur.utilisateurId);
  assert.ok(utilisateur);

  const login2 = await bootstrap.obtenirLoginUseCase().executer({
    email: utilisateur!.obtenirEmail().obtenirValeur(),
    motDePasse: 'secret',
    organisationActiveId: TENANT_FIXTURES.organisationA,
    ecoleActiveId: TENANT_FIXTURES.ecoleA1,
  });

  const serveur = await bootstrap.creerServeur();
  assert.equal((await injecterCommeActeur(serveur, acteur, { method: 'GET', url: '/probe/context' })).statusCode, 200);

  await bootstrap.obtenirLogoutUseCase().executer({ sessionId: acteur.sessionId });
  assert.equal((await injecterCommeActeur(serveur, acteur, { method: 'GET', url: '/probe/context' })).statusCode, 401);

  const secondeSession = await serveur.inject({
    method: 'GET',
    url: '/probe/context',
    headers: {
      authorization: `Bearer ${login2.accessToken}`,
      'x-session-id': login2.sessionId,
      'x-organisation-id': TENANT_FIXTURES.organisationA,
      'x-tenant-id': TENANT_FIXTURES.ecoleA1,
    },
  });
  assert.equal(secondeSession.statusCode, 200, secondeSession.body);

  await serveur.close();
});
