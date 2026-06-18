import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationParcoursEleveAdapter } from '../../../app/adapters/AutorisationParcoursEleveAdapter';
import { ROLE_FIXTURES, TENANT_FIXTURES, WORKFLOW_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';

test('SECURITY reserve le parcours scolaire aux superviseurs pedagogiques de la bonne section', async () => {
  const bootstrap = new GlobalTestBootstrap();
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
  const directeurPrimaire = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.DIRECTEUR_PRIMAIRE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    sectionId: WORKFLOW_FIXTURES.sectionPrimaire,
  });
  const directeurMaternelle = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.DIRECTEUR_MATERNELLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    sectionId: WORKFLOW_FIXTURES.sectionMaternelle,
  });
  const caissier = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.CAISSIER,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const enseignant = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ENSEIGNANT,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    sectionId: WORKFLOW_FIXTURES.sectionSecondaire,
  });
  const administrateur = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const adaptateur = new AutorisationParcoursEleveAdapter({
    async resoudrePerimetreEleve({ idEleve }) {
      if (idEleve === WORKFLOW_FIXTURES.eleveA) {
        return {
          idOrganisation: TENANT_FIXTURES.organisationA,
          idEcole: TENANT_FIXTURES.ecoleA1,
          idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
          idSectionScolaire: WORKFLOW_FIXTURES.sectionSecondaire,
          sectionCode: 'SECONDAIRE',
        };
      }

      if (idEleve === 'eleve-maternelle') {
        return {
          idOrganisation: TENANT_FIXTURES.organisationA,
          idEcole: TENANT_FIXTURES.ecoleA1,
          idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
          idSectionScolaire: WORKFLOW_FIXTURES.sectionMaternelle,
          sectionCode: 'MATERNELLE',
        };
      }

      return {
        idOrganisation: TENANT_FIXTURES.organisationA,
        idEcole: TENANT_FIXTURES.ecoleA1,
        idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
        idSectionScolaire: WORKFLOW_FIXTURES.sectionPrimaire,
        sectionCode: 'PRIMAIRE',
      };
    },
  });

  await assert.doesNotReject(() => adaptateur.verifierConsultationParcoursEleve({
    idUtilisateur: prefet.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.doesNotReject(() => adaptateur.verifierReconstructionParcoursEleve({
    idUtilisateur: directeurEtudes.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.doesNotReject(() => adaptateur.verifierConsultationParcoursEleve({
    idUtilisateur: directeurPrimaire.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveB,
  }));

  await assert.doesNotReject(() => adaptateur.verifierConsultationParcoursEleve({
    idUtilisateur: directeurMaternelle.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: 'eleve-maternelle',
  }));

  await assert.rejects(() => adaptateur.verifierConsultationParcoursEleve({
    idUtilisateur: caissier.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.rejects(() => adaptateur.verifierConsultationParcoursEleve({
    idUtilisateur: enseignant.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.rejects(() => adaptateur.verifierConsultationParcoursEleve({
    idUtilisateur: administrateur.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.rejects(() => adaptateur.verifierConsultationParcoursEleve({
    idUtilisateur: directeurPrimaire.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  assert.deepEqual(
    (await adaptateur.listerSectionsLectureAutorisees({
      idUtilisateur: directeurEtudes.utilisateurId,
      idOrganisation: TENANT_FIXTURES.organisationA,
      idEcole: TENANT_FIXTURES.ecoleA1,
    })).sort(),
    [WORKFLOW_FIXTURES.sectionSecondaire],
  );

  await adaptateur.fermer();
});
