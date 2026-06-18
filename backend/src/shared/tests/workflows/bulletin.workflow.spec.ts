import assert from 'node:assert/strict';
import test from 'node:test';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';
import { ROLE_FIXTURES, TENANT_FIXTURES, WORKFLOW_FIXTURES } from '../fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../helpers/GlobalTestHelpers';

test('workflow complet fiche -> bulletin -> proclamation', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const enseignant = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ENSEIGNANT,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    classeId: WORKFLOW_FIXTURES.classeA,
  });
  const titulaire = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.TITULAIRE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    classeId: WORKFLOW_FIXTURES.classeA,
    titulaireClasseId: WORKFLOW_FIXTURES.classeA,
    titulaireAnneeScolaireId: WORKFLOW_FIXTURES.anneeScolaireId,
  });
  const administrateurEcole = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    classeId: WORKFLOW_FIXTURES.classeA,
  });
  const serveur = await bootstrap.creerServeur();
  assert.equal((await injecterCommeActeur(serveur, enseignant, { method: 'POST', url: '/bc/bulletins/fiches/encoder' })).statusCode, 200);
  assert.equal((await injecterCommeActeur(serveur, titulaire, { method: 'POST', url: '/bc/bulletins/generer', payload: { idClasse: WORKFLOW_FIXTURES.classeA, idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId } })).statusCode, 200);
  assert.equal((await injecterCommeActeur(serveur, administrateurEcole, { method: 'POST', url: '/bc/proclamations/generer', payload: { idClasse: WORKFLOW_FIXTURES.classeA, idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId } })).statusCode, 200);
  await serveur.close();
});
