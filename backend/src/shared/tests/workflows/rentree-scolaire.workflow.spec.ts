import assert from 'node:assert/strict';
import test from 'node:test';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../helpers/GlobalTestHelpers';

test('workflow rentree scolaire multi-modules', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const admin = await bootstrap.creerActeur({ ...ROLE_FIXTURES.ADMIN_ECOLE, organisationId: TENANT_FIXTURES.organisationA, ecoleId: TENANT_FIXTURES.ecoleA1 });
  const serveur = await bootstrap.creerServeur();
  assert.equal((await injecterCommeActeur(serveur, admin, { method: 'POST', url: '/bc/referentiel/modifier' })).statusCode, 200);
  assert.equal((await injecterCommeActeur(serveur, admin, { method: 'POST', url: '/bc/scolarite/abandon' })).statusCode, 200);
  await serveur.close();
});
