import assert from 'node:assert/strict';
import test from 'node:test';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../helpers/GlobalTestHelpers';

test('une ecole ne voit jamais une autre ecole', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const adminA = await bootstrap.creerActeur({ ...ROLE_FIXTURES.ADMIN_ECOLE, organisationId: TENANT_FIXTURES.organisationA, ecoleId: TENANT_FIXTURES.ecoleA1 });
  const serveur = await bootstrap.creerServeur();

  assert.equal((await injecterCommeActeur(serveur, adminA, { method: 'GET', url: '/bc/bulletins/lire' })).statusCode, 200);
  assert.equal((await injecterCommeActeur(serveur, adminA, { method: 'GET', url: '/bc/bulletins/lire', headers: { 'x-tenant-id': TENANT_FIXTURES.ecoleA2 } })).statusCode, 403);
  assert.equal((await injecterCommeActeur(serveur, adminA, { method: 'GET', url: '/bc/paiements/lire', headers: { 'x-tenant-id': TENANT_FIXTURES.ecoleB1 } })).statusCode, 403);

  await serveur.close();
});
