import assert from 'node:assert/strict';
import test from 'node:test';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../helpers/GlobalTestHelpers';

test('SECURITY applique bien les regles d acces sur les paiements', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const caissier = await bootstrap.creerActeur({ ...ROLE_FIXTURES.CAISSIER, organisationId: TENANT_FIXTURES.organisationA, ecoleId: TENANT_FIXTURES.ecoleA1 });
  const enseignant = await bootstrap.creerActeur({ ...ROLE_FIXTURES.ENSEIGNANT, organisationId: TENANT_FIXTURES.organisationA, ecoleId: TENANT_FIXTURES.ecoleA1 });
  const prefet = await bootstrap.creerActeur({ ...ROLE_FIXTURES.PREFET, organisationId: TENANT_FIXTURES.organisationA, ecoleId: TENANT_FIXTURES.ecoleA1 });
  const admin = await bootstrap.creerActeur({ ...ROLE_FIXTURES.ADMIN_ECOLE, organisationId: TENANT_FIXTURES.organisationA, ecoleId: TENANT_FIXTURES.ecoleA1 });
  const parent = await bootstrap.creerActeur({ ...ROLE_FIXTURES.PARENT, organisationId: TENANT_FIXTURES.organisationA, ecoleId: TENANT_FIXTURES.ecoleA1 });
  const serveur = await bootstrap.creerServeur();

  assert.equal((await injecterCommeActeur(serveur, caissier, { method: 'POST', url: '/bc/paiements/percevoir' })).statusCode, 200);
  assert.equal((await injecterCommeActeur(serveur, enseignant, { method: 'POST', url: '/bc/paiements/percevoir' })).statusCode, 403);
  assert.equal((await injecterCommeActeur(serveur, prefet, { method: 'GET', url: '/bc/paiements/lire' })).statusCode, 200);
  assert.equal((await injecterCommeActeur(serveur, admin, { method: 'POST', url: '/bc/paiements/percevoir' })).statusCode, 200);
  assert.equal((await injecterCommeActeur(serveur, parent, { method: 'POST', url: '/bc/caisse/ouvrir' })).statusCode, 403);

  await serveur.close();
});
