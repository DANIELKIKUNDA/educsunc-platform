import assert from 'node:assert/strict';
import test from 'node:test';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';
import { ROLE_FIXTURES, TENANT_FIXTURES, WORKFLOW_FIXTURES } from '../fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../helpers/GlobalTestHelpers';

test('workflow abandon, transfert et consultation parent', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const prefet = await bootstrap.creerActeur({ ...ROLE_FIXTURES.PREFET, organisationId: TENANT_FIXTURES.organisationA, ecoleId: TENANT_FIXTURES.ecoleA1 });
  const parent = await bootstrap.creerActeur({ ...ROLE_FIXTURES.PARENT, organisationId: TENANT_FIXTURES.organisationA, ecoleId: TENANT_FIXTURES.ecoleA1, elevesAutorises: [WORKFLOW_FIXTURES.eleveA] });
  const serveur = await bootstrap.creerServeur();
  assert.equal((await injecterCommeActeur(serveur, prefet, { method: 'POST', url: '/bc/scolarite/abandon' })).statusCode, 200);
  assert.equal((await injecterCommeActeur(serveur, prefet, { method: 'POST', url: '/bc/scolarite/transfert' })).statusCode, 200);
  assert.equal((await injecterCommeActeur(serveur, parent, { method: 'GET', url: `/bc/parent/enfants/${WORKFLOW_FIXTURES.eleveA}` })).statusCode, 200);
  await serveur.close();
});
