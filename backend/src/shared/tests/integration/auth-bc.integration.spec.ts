import assert from 'node:assert/strict';
import test from 'node:test';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../helpers/GlobalTestHelpers';

test('les BC recuperent bien utilisateur, role et tenant depuis request.context', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const acteur = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const serveur = await bootstrap.creerServeur();

  const reponse = await injecterCommeActeur(serveur, acteur, {
    method: 'GET',
    url: '/probe/context',
  });

  assert.equal(reponse.statusCode, 200, reponse.body);
  const corps = reponse.json() as {
    utilisateurId: string;
    roleActif: string;
    organisationActiveId: string;
    ecoleActiveId: string;
  };
  assert.equal(corps.utilisateurId, acteur.utilisateurId);
  assert.equal(corps.roleActif, 'ADMINISTRATEUR_ECOLE');
  assert.equal(corps.organisationActiveId, TENANT_FIXTURES.organisationA);
  assert.equal(corps.ecoleActiveId, TENANT_FIXTURES.ecoleA1);

  await serveur.close();
});
