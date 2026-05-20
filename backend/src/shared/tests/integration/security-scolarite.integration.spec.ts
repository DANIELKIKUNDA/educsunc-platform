import assert from 'node:assert/strict';
import test from 'node:test';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../helpers/GlobalTestHelpers';

test('SECURITY applique bien les regles d acces sur la scolarite', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const prefet = await bootstrap.creerActeur({ ...ROLE_FIXTURES.PREFET, organisationId: TENANT_FIXTURES.organisationA, ecoleId: TENANT_FIXTURES.ecoleA1 });
  const enseignant = await bootstrap.creerActeur({ ...ROLE_FIXTURES.ENSEIGNANT, organisationId: TENANT_FIXTURES.organisationA, ecoleId: TENANT_FIXTURES.ecoleA1 });
  const directeur = await bootstrap.creerActeur({ ...ROLE_FIXTURES.DIRECTEUR_ETUDES, organisationId: TENANT_FIXTURES.organisationA, ecoleId: TENANT_FIXTURES.ecoleA1 });
  const caissier = await bootstrap.creerActeur({ ...ROLE_FIXTURES.CAISSIER, organisationId: TENANT_FIXTURES.organisationA, ecoleId: TENANT_FIXTURES.ecoleA1 });
  const serveur = await bootstrap.creerServeur();

  assert.equal((await injecterCommeActeur(serveur, prefet, { method: 'POST', url: '/bc/scolarite/abandon' })).statusCode, 200);
  assert.equal((await injecterCommeActeur(serveur, enseignant, { method: 'GET', url: '/bc/scolarite/lire' })).statusCode, 200);
  assert.equal((await injecterCommeActeur(serveur, directeur, { method: 'GET', url: '/bc/scolarite/lire' })).statusCode, 200);
  assert.equal((await injecterCommeActeur(serveur, caissier, { method: 'POST', url: '/bc/scolarite/abandon' })).statusCode, 403);

  await serveur.close();
});
