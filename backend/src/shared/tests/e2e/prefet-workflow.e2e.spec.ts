import assert from 'node:assert/strict';
import test from 'node:test';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../helpers/GlobalTestHelpers';

test('workflow prefet', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const prefet = await bootstrap.creerActeur({ ...ROLE_FIXTURES.PREFET, organisationId: TENANT_FIXTURES.organisationA, ecoleId: TENANT_FIXTURES.ecoleA1 });
  const serveur = await bootstrap.creerServeur();

  assert.equal((await injecterCommeActeur(serveur, prefet, { method: 'GET', url: '/bc/bulletins/lire' })).statusCode, 200);
  assert.equal((await injecterCommeActeur(serveur, prefet, { method: 'GET', url: '/bc/finances/lire' })).statusCode, 200);
  assert.equal((await injecterCommeActeur(serveur, prefet, { method: 'POST', url: '/bc/scolarite/abandon' })).statusCode, 200);

  await serveur.close();
});
