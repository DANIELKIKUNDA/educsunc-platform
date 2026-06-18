import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationOuvertureCaisseAdapter } from '../../../app/adapters/AutorisationOuvertureCaisseAdapter';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';

test("SECURITY applique la doctrine locale d'ouverture de caisse", async () => {
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
  const gestionnaireOrganisation = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.GESTIONNAIRE_ORGANISATION,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const promoteurOrganisation = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.PROMOTEUR_ORGANISATION,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const prefet = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.PREFET,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const adaptateur = new AutorisationOuvertureCaisseAdapter();

  await assert.doesNotReject(() => adaptateur.verifierOuvertureCaisse({
    idUtilisateur: caissier.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
  }));

  await assert.rejects(() => adaptateur.verifierOuvertureCaisse({
    idUtilisateur: administrateur.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
  }));

  await assert.rejects(() => adaptateur.verifierOuvertureCaisse({
    idUtilisateur: prefet.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
  }));

  await assert.doesNotReject(() => adaptateur.verifierClotureCaisse({
    idUtilisateur: caissier.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
  }));

  await assert.rejects(() => adaptateur.verifierClotureCaisse({
    idUtilisateur: administrateur.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
  }));

  await assert.doesNotReject(() => adaptateur.verifierConsultationCaisse({
    idUtilisateur: caissier.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
  }));

  await assert.doesNotReject(() => adaptateur.verifierConsultationCaisse({
    idUtilisateur: administrateur.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
  }));

  await assert.doesNotReject(() => adaptateur.verifierConsultationCaisse({
    idUtilisateur: gestionnaireOrganisation.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
  }));

  await assert.doesNotReject(() => adaptateur.verifierConsultationCaisse({
    idUtilisateur: promoteurOrganisation.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
  }));

  await assert.rejects(() => adaptateur.verifierConsultationCaisse({
    idUtilisateur: prefet.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
  }));
});
