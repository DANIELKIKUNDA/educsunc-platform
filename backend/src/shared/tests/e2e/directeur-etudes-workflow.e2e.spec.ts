import assert from 'node:assert/strict';
import test from 'node:test';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../helpers/GlobalTestHelpers';

test('workflow directeur des etudes', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const acteur = await bootstrap.creerActeur({ ...ROLE_FIXTURES.DIRECTEUR_ETUDES, organisationId: TENANT_FIXTURES.organisationA, ecoleId: TENANT_FIXTURES.ecoleA1 });
  const serveur = await bootstrap.creerServeur();

  assert.equal((await injecterCommeActeur(serveur, acteur, { method: 'GET', url: '/bc/bulletins/lire' })).statusCode, 200);
  assert.equal((await injecterCommeActeur(serveur, acteur, { method: 'GET', url: '/bc/finances/lire' })).statusCode, 200);
  assert.equal((await injecterCommeActeur(serveur, acteur, { method: 'POST', url: '/bc/caisse/ouvrir' })).statusCode, 403);

  await serveur.close();
});
