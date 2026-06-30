import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationConsultationStatistiquesAdapter } from '../../../app/adapters/AutorisationConsultationStatistiquesAdapter';
import { ROLE_FIXTURES, TENANT_FIXTURES, WORKFLOW_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';

test('SECURITY applique bien les regles locales de consultation des statistiques', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const titulaire = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ENSEIGNANT,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    classeId: WORKFLOW_FIXTURES.classeA,
    titulaireClasseId: WORKFLOW_FIXTURES.classeA,
    titulaireAnneeScolaireId: WORKFLOW_FIXTURES.anneeScolaireId,
  });
  const enseignant = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ENSEIGNANT,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    classeId: WORKFLOW_FIXTURES.classeA,
  });
  const prefet = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.PREFET,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    sectionId: WORKFLOW_FIXTURES.sectionSecondaire,
  });
  const directeurEtudes = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.DIRECTEUR_ETUDES,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    sectionId: WORKFLOW_FIXTURES.sectionSecondaire,
  });
  const parent = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.PARENT,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const administrateur = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const promoteurOrganisation = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.PROMOTEUR_ORGANISATION,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const adaptateur = new AutorisationConsultationStatistiquesAdapter({
    async resoudreSectionClasse({ idClassePedagogique }) {
      if (idClassePedagogique === WORKFLOW_FIXTURES.classeA) {
        return WORKFLOW_FIXTURES.sectionSecondaire;
      }

      if (idClassePedagogique === WORKFLOW_FIXTURES.classeB) {
        return WORKFLOW_FIXTURES.sectionPrimaire;
      }

      return null;
    },
  });

  await adaptateur.verifierConsultationStatistiquesClasse({
    idUtilisateur: titulaire.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idClassePedagogique: WORKFLOW_FIXTURES.classeA,
    idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
  });

  await adaptateur.verifierConsultationStatistiquesClasse({
    idUtilisateur: prefet.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idClassePedagogique: WORKFLOW_FIXTURES.classeA,
    idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
  });

  await assert.rejects(
    () => adaptateur.verifierConsultationStatistiquesClasse({
      idUtilisateur: enseignant.utilisateurId,
      idOrganisation: TENANT_FIXTURES.organisationA,
      idEcole: TENANT_FIXTURES.ecoleA1,
      idClassePedagogique: WORKFLOW_FIXTURES.classeA,
      idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
    }),
    /pas autorise/i,
  );

  await assert.rejects(
    () => adaptateur.verifierConsultationStatistiquesEcole({
      idUtilisateur: administrateur.utilisateurId,
      idOrganisation: TENANT_FIXTURES.organisationA,
      idEcole: TENANT_FIXTURES.ecoleA1,
      idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
    }),
    /pas autorise/i,
  );

  await assert.rejects(
    () => adaptateur.verifierConsultationStatistiquesEcole({
      idUtilisateur: parent.utilisateurId,
      idOrganisation: TENANT_FIXTURES.organisationA,
      idEcole: TENANT_FIXTURES.ecoleA1,
      idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
    }),
    /pas autorise/i,
  );

  await assert.rejects(
    () => adaptateur.verifierConsultationStatistiquesEcole({
      idUtilisateur: directeurEtudes.utilisateurId,
      idOrganisation: TENANT_FIXTURES.organisationA,
      idEcole: TENANT_FIXTURES.ecoleA1,
      idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
    }),
    /pas autorise/i,
  );

  await assert.rejects(
    () => adaptateur.verifierConsultationStatistiquesEcole({
      idUtilisateur: promoteurOrganisation.utilisateurId,
      idOrganisation: TENANT_FIXTURES.organisationA,
      idEcole: TENANT_FIXTURES.ecoleA1,
      idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
    }),
    /pas autorise/i,
  );

  await assert.rejects(
    () => adaptateur.verifierConsultationStatistiquesClasse({
      idUtilisateur: prefet.utilisateurId,
      idOrganisation: TENANT_FIXTURES.organisationA,
      idEcole: TENANT_FIXTURES.ecoleA1,
      idClassePedagogique: WORKFLOW_FIXTURES.classeB,
      idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
    }),
    /pas autorise/i,
  );

  await assert.rejects(
    () => adaptateur.verifierConsultationStatistiquesClasse({
      idUtilisateur: titulaire.utilisateurId,
      idOrganisation: TENANT_FIXTURES.organisationA,
      idEcole: TENANT_FIXTURES.ecoleA1,
      idClassePedagogique: WORKFLOW_FIXTURES.classeB,
      idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
    }),
    /pas autorise/i,
  );

  await adaptateur.fermer();
});
