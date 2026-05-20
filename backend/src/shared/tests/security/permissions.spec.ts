import assert from 'node:assert/strict';
import test from 'node:test';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../helpers/GlobalTestHelpers';

test('permissions valides, refus et restrictions metier sont appliquees', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const enseignant = await bootstrap.creerActeur({ ...ROLE_FIXTURES.ENSEIGNANT, organisationId: TENANT_FIXTURES.organisationA, ecoleId: TENANT_FIXTURES.ecoleA1 });
  const caissier = await bootstrap.creerActeur({ ...ROLE_FIXTURES.CAISSIER, organisationId: TENANT_FIXTURES.organisationA, ecoleId: TENANT_FIXTURES.ecoleA1 });
  const serveur = await bootstrap.creerServeur();

  assert.equal((await injecterCommeActeur(serveur, enseignant, { method: 'POST', url: '/bc/bulletins/fiches/encoder' })).statusCode, 200);
  assert.equal((await injecterCommeActeur(serveur, enseignant, { method: 'POST', url: '/bc/paiements/percevoir' })).statusCode, 403);
  assert.equal((await injecterCommeActeur(serveur, caissier, { method: 'GET', url: '/bc/bulletins/lire' })).statusCode, 403);

  await serveur.close();
});
