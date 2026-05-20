import assert from 'node:assert/strict';
import test from 'node:test';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../helpers/GlobalTestHelpers';

test('SECURITY et TENANCY propagent le tenant actif et refusent le tenant etranger', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const acteur = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const serveur = await bootstrap.creerServeur();

  const autorisee = await injecterCommeActeur(serveur, acteur, {
    method: 'GET',
    url: '/bc/referentiel/lire',
  });
  assert.equal(autorisee.statusCode, 200, autorisee.body);

  const ecoleEtrangere = await injecterCommeActeur(serveur, acteur, {
    method: 'GET',
    url: '/bc/referentiel/lire',
    headers: { 'x-tenant-id': TENANT_FIXTURES.ecoleB1 },
  });
  assert.equal(ecoleEtrangere.statusCode, 403, ecoleEtrangere.body);

  const organisationEtrangere = await injecterCommeActeur(serveur, acteur, {
    method: 'GET',
    url: '/bc/referentiel/lire',
    headers: { 'x-organisation-id': TENANT_FIXTURES.organisationB },
  });
  assert.equal(organisationEtrangere.statusCode, 403, organisationEtrangere.body);

  await serveur.close();
});
