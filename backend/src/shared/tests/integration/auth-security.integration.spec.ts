import assert from 'node:assert/strict';
import test from 'node:test';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../helpers/GlobalTestHelpers';

test('AUTH injecte le RequestContext et SECURITY l enrichit completement', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const acteur = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ENSEIGNANT,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const serveur = await bootstrap.creerServeur();

  const reponse = await injecterCommeActeur(serveur, acteur, {
    method: 'GET',
    url: '/probe/context',
  });

  assert.equal(reponse.statusCode, 200, reponse.body);
  const corps = reponse.json() as Record<string, unknown>;
  assert.equal(corps.utilisateurId, acteur.utilisateurId);
  assert.equal(corps.sessionId, acteur.sessionId);
  assert.equal(corps.roleActif, 'ENSEIGNANT');
  assert.equal(corps.organisationActiveId, TENANT_FIXTURES.organisationA);
  assert.equal(corps.ecoleActiveId, TENANT_FIXTURES.ecoleA1);
  assert.ok(Array.isArray(corps.permissions));
  assert.ok(Array.isArray(corps.scopes));
  assert.ok(Array.isArray(corps.restrictions));
  assert.ok(Array.isArray(corps.titulariats));

  await serveur.close();
});
