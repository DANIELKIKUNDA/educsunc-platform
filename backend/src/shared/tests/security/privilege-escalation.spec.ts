import assert from 'node:assert/strict';
import test from 'node:test';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../helpers/GlobalTestHelpers';

test('les tentatives d escalade de privileges sont refusees', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const parent = await bootstrap.creerActeur({ ...ROLE_FIXTURES.PARENT, organisationId: TENANT_FIXTURES.organisationA, ecoleId: TENANT_FIXTURES.ecoleA1 });
  const caissier = await bootstrap.creerActeur({ ...ROLE_FIXTURES.CAISSIER, organisationId: TENANT_FIXTURES.organisationA, ecoleId: TENANT_FIXTURES.ecoleA1 });
  const serveur = await bootstrap.creerServeur();

  assert.equal((await injecterCommeActeur(serveur, parent, { method: 'POST', url: '/bc/referentiel/modifier' })).statusCode, 403);
  assert.equal((await injecterCommeActeur(serveur, parent, { method: 'POST', url: '/bc/caisse/ouvrir' })).statusCode, 403);
  assert.equal((await injecterCommeActeur(serveur, caissier, { method: 'POST', url: '/bc/referentiel/modifier' })).statusCode, 403);

  await serveur.close();
});
