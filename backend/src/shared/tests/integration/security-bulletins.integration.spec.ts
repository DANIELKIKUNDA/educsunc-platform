import assert from 'node:assert/strict';
import test from 'node:test';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';
import { ROLE_FIXTURES, TENANT_FIXTURES, WORKFLOW_FIXTURES } from '../fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../helpers/GlobalTestHelpers';

test('SECURITY applique bien les regles d acces sur les bulletins', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const enseignant = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ENSEIGNANT,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const titulaire = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ENSEIGNANT,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    classeId: WORKFLOW_FIXTURES.classeA,
    titulaireClasseId: WORKFLOW_FIXTURES.classeA,
    titulaireAnneeScolaireId: WORKFLOW_FIXTURES.anneeScolaireId,
  });
  const prefet = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.PREFET,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const parent = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.PARENT,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const caissier = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.CAISSIER,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const serveur = await bootstrap.creerServeur();

  assert.equal((await injecterCommeActeur(serveur, enseignant, {
    method: 'POST',
    url: '/bc/bulletins/fiches/encoder',
  })).statusCode, 200);

  assert.equal((await injecterCommeActeur(serveur, titulaire, {
    method: 'POST',
    url: '/bc/bulletins/generer',
    payload: { idClasse: WORKFLOW_FIXTURES.classeA, idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId },
  })).statusCode, 200);

  assert.equal((await injecterCommeActeur(serveur, prefet, {
    method: 'GET',
    url: '/bc/bulletins/lire',
  })).statusCode, 200);

  assert.equal((await injecterCommeActeur(serveur, parent, {
    method: 'POST',
    url: '/bc/bulletins/fiches/encoder',
  })).statusCode, 403);

  assert.equal((await injecterCommeActeur(serveur, caissier, {
    method: 'GET',
    url: '/bc/bulletins/lire',
  })).statusCode, 403);

  await serveur.close();
});
