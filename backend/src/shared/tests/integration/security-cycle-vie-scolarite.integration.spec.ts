import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationCycleVieEleveAdapter } from '../../../app/adapters/AutorisationCycleVieEleveAdapter';
import { StatutEleve } from '../../../contexts/scolarite-eleves/domain/value-objects/StatutEleve';
import { ROLE_FIXTURES, TENANT_FIXTURES, WORKFLOW_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';

test('SECURITY applique la doctrine locale du cycle de vie scolaire', async () => {
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
  const directeurDiscipline = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.DIRECTEUR_DISCIPLINE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    sectionId: WORKFLOW_FIXTURES.sectionSecondaire,
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

  const adaptateur = new AutorisationCycleVieEleveAdapter({
    async resoudrePerimetreEleve({ idEleve }) {
      if (idEleve === WORKFLOW_FIXTURES.eleveA) {
        return {
          idOrganisation: TENANT_FIXTURES.organisationA,
          idEcole: TENANT_FIXTURES.ecoleA1,
          idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
          idClassePedagogique: WORKFLOW_FIXTURES.classeA,
          idSectionScolaire: WORKFLOW_FIXTURES.sectionSecondaire,
          sectionCode: 'SECONDAIRE',
          sectionLibelle: 'Secondaire',
        };
      }

      if (idEleve === 'eleve-maternelle') {
        return {
          idOrganisation: TENANT_FIXTURES.organisationA,
          idEcole: TENANT_FIXTURES.ecoleA1,
          idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
          idClassePedagogique: 'classe-maternelle',
          idSectionScolaire: WORKFLOW_FIXTURES.sectionMaternelle,
          sectionCode: 'MATERNELLE',
          sectionLibelle: 'Maternelle',
        };
      }

      return {
        idOrganisation: TENANT_FIXTURES.organisationA,
        idEcole: TENANT_FIXTURES.ecoleA1,
        idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
        idClassePedagogique: WORKFLOW_FIXTURES.classeB,
        idSectionScolaire: WORKFLOW_FIXTURES.sectionPrimaire,
        sectionCode: 'PRIMAIRE',
        sectionLibelle: 'Primaire',
      };
    },
  });

  await assert.doesNotReject(() => adaptateur.verifierMutationStatutEleve({
    idUtilisateur: prefet.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
    nouveauStatut: StatutEleve.ABANDONNE,
  }));

  await assert.doesNotReject(() => adaptateur.verifierMutationStatutEleve({
    idUtilisateur: directeurEtudes.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
    nouveauStatut: StatutEleve.TRANSFERE,
  }));

  await assert.doesNotReject(() => adaptateur.verifierMutationStatutEleve({
    idUtilisateur: directeurPrimaire.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveB,
    nouveauStatut: StatutEleve.SUSPENDU,
  }));

  await assert.doesNotReject(() => adaptateur.verifierMutationStatutEleve({
    idUtilisateur: directeurMaternelle.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: 'eleve-maternelle',
    nouveauStatut: StatutEleve.SUSPENDU,
  }));

  await assert.doesNotReject(() => adaptateur.verifierMutationStatutEleve({
    idUtilisateur: directeurDiscipline.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
    nouveauStatut: StatutEleve.SUSPENDU,
  }));

  await assert.doesNotReject(() => adaptateur.verifierMutationStatutEleve({
    idUtilisateur: caissier.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
    nouveauStatut: StatutEleve.DECEDE,
  }));

  await assert.rejects(() => adaptateur.verifierMutationStatutEleve({
    idUtilisateur: directeurDiscipline.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
    nouveauStatut: StatutEleve.ABANDONNE,
  }));

  await assert.rejects(() => adaptateur.verifierMutationStatutEleve({
    idUtilisateur: caissier.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
    nouveauStatut: StatutEleve.SUSPENDU,
  }));

  await assert.rejects(() => adaptateur.verifierMutationStatutEleve({
    idUtilisateur: enseignant.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
    nouveauStatut: StatutEleve.TRANSFERE,
  }));

  await assert.rejects(() => adaptateur.verifierMutationStatutEleve({
    idUtilisateur: administrateur.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
    nouveauStatut: StatutEleve.ACTIF,
  }));

  await assert.rejects(() => adaptateur.verifierMutationStatutEleve({
    idUtilisateur: directeurPrimaire.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
    nouveauStatut: StatutEleve.SUSPENDU,
  }));

  await adaptateur.fermer();
});
