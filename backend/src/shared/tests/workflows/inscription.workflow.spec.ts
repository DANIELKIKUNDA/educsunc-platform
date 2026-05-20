import assert from 'node:assert/strict';
import test from 'node:test';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../helpers/GlobalTestHelpers';

test('workflow inscription et affectation', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const admin = await bootstrap.creerActeur({ ...ROLE_FIXTURES.ADMIN_ECOLE, organisationId: TENANT_FIXTURES.organisationA, ecoleId: TENANT_FIXTURES.ecoleA1 });
  const serveur = await bootstrap.creerServeur();
  assert.equal((await injecterCommeActeur(serveur, admin, { method: 'GET', url: '/bc/scolarite/lire' })).statusCode, 200);
  await serveur.close();
});
