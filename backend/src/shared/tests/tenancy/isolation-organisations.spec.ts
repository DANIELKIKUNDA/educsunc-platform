import assert from 'node:assert/strict';
import test from 'node:test';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../helpers/GlobalTestHelpers';

test('une organisation ne voit jamais une autre organisation', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const promoteur = await bootstrap.creerActeur({ ...ROLE_FIXTURES.PROMOTEUR_ORGANISATION, organisationId: TENANT_FIXTURES.organisationA, ecoleId: TENANT_FIXTURES.ecoleA1 });
  const serveur = await bootstrap.creerServeur();

  assert.equal((await injecterCommeActeur(serveur, promoteur, { method: 'GET', url: '/bc/organisation/synthese' })).statusCode, 200);
  assert.equal((await injecterCommeActeur(serveur, promoteur, { method: 'GET', url: '/bc/organisation/synthese', headers: { 'x-organisation-id': TENANT_FIXTURES.organisationB } })).statusCode, 403);

  await serveur.close();
});
