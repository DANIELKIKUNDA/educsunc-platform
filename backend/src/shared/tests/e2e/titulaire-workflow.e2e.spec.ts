import assert from 'node:assert/strict';
import test from 'node:test';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';
import { ROLE_FIXTURES, TENANT_FIXTURES, WORKFLOW_FIXTURES } from '../fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../helpers/GlobalTestHelpers';

test('workflow titulaire', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const titulaire = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ENSEIGNANT,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    classeId: WORKFLOW_FIXTURES.classeA,
    titulaireClasseId: WORKFLOW_FIXTURES.classeA,
    titulaireAnneeScolaireId: WORKFLOW_FIXTURES.anneeScolaireId,
  });
  const serveur = await bootstrap.creerServeur();

  assert.equal((await injecterCommeActeur(serveur, titulaire, { method: 'POST', url: '/bc/bulletins/generer', payload: { idClasse: WORKFLOW_FIXTURES.classeA, idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId } })).statusCode, 200);
  assert.equal((await injecterCommeActeur(serveur, titulaire, { method: 'POST', url: '/bc/proclamations/generer', payload: { idClasse: WORKFLOW_FIXTURES.classeA, idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId } })).statusCode, 200);
  assert.equal((await injecterCommeActeur(serveur, titulaire, { method: 'GET', url: '/bc/finances/lire' })).statusCode, 200);

  await serveur.close();
});
