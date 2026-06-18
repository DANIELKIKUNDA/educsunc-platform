import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationReimpressionRecuAdapter } from '../../../app/adapters/AutorisationReimpressionRecuAdapter';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';

test("SECURITY reserve la reimpression d'un recu au seul caissier de l'ecole", async () => {
  const bootstrap = new GlobalTestBootstrap();
  const caissier = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.CAISSIER,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const administrateur = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const adaptateur = new AutorisationReimpressionRecuAdapter();

  await assert.doesNotReject(() => adaptateur.verifierReimpressionRecu({
    idUtilisateur: caissier.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
  }));

  await assert.rejects(() => adaptateur.verifierReimpressionRecu({
    idUtilisateur: administrateur.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
  }));
});
