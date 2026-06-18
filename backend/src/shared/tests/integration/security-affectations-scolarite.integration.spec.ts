import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationAffectationClasseAdapter } from '../../../app/adapters/AutorisationAffectationClasseAdapter';
import { ROLE_FIXTURES, TENANT_FIXTURES, WORKFLOW_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';

test('SECURITY applique la doctrine locale des affectations de classes', async () => {
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

  const adaptateur = new AutorisationAffectationClasseAdapter({
    async resoudreInscription({ idInscriptionScolaire }) {
      if (idInscriptionScolaire === 'inscription-primaire') {
        return {
          idOrganisation: TENANT_FIXTURES.organisationA,
          idEcole: TENANT_FIXTURES.ecoleA1,
          idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
        };
      }

      if (idInscriptionScolaire === 'inscription-maternelle') {
        return {
          idOrganisation: TENANT_FIXTURES.organisationA,
          idEcole: TENANT_FIXTURES.ecoleA1,
          idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
        };
      }

      return {
        idOrganisation: TENANT_FIXTURES.organisationA,
        idEcole: TENANT_FIXTURES.ecoleA1,
        idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
        idClassePedagogique: WORKFLOW_FIXTURES.classeA,
        idSectionScolaire: WORKFLOW_FIXTURES.sectionSecondaire,
        sectionCode: 'SECONDAIRE',
      };
    },
    async resoudreClasse({ idClassePedagogique }) {
      if (idClassePedagogique === 'classe-primaire') {
        return {
          idEcole: TENANT_FIXTURES.ecoleA1,
          idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
          idSectionScolaire: WORKFLOW_FIXTURES.sectionPrimaire,
          sectionCode: 'PRIMAIRE',
        };
      }

      if (idClassePedagogique === 'classe-maternelle') {
        return {
          idEcole: TENANT_FIXTURES.ecoleA1,
          idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
          idSectionScolaire: WORKFLOW_FIXTURES.sectionMaternelle,
          sectionCode: 'MATERNELLE',
        };
      }

      return {
        idEcole: TENANT_FIXTURES.ecoleA1,
        idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
        idSectionScolaire: WORKFLOW_FIXTURES.sectionSecondaire,
        sectionCode: 'SECONDAIRE',
      };
    },
  });

  await assert.doesNotReject(() => adaptateur.verifierCreationAffectationClasse({
    idUtilisateur: prefet.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idInscriptionScolaire: 'inscription-secondaire',
    idClassePedagogique: WORKFLOW_FIXTURES.classeA,
  }));

  await assert.doesNotReject(() => adaptateur.verifierChangementClasse({
    idUtilisateur: directeurEtudes.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idInscriptionScolaire: 'inscription-secondaire',
    idNouvelleClassePedagogique: WORKFLOW_FIXTURES.classeB,
  }));

  await assert.doesNotReject(() => adaptateur.verifierCreationAffectationClasse({
    idUtilisateur: directeurPrimaire.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idInscriptionScolaire: 'inscription-primaire',
    idClassePedagogique: 'classe-primaire',
  }));

  await assert.doesNotReject(() => adaptateur.verifierCreationAffectationClasse({
    idUtilisateur: directeurMaternelle.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idInscriptionScolaire: 'inscription-maternelle',
    idClassePedagogique: 'classe-maternelle',
  }));

  await assert.doesNotReject(() => adaptateur.verifierConsultationClassePedagogique({
    idUtilisateur: caissier.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idClassePedagogique: WORKFLOW_FIXTURES.classeA,
  }));

  await assert.rejects(() => adaptateur.verifierCreationAffectationClasse({
    idUtilisateur: directeurDiscipline.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idInscriptionScolaire: 'inscription-secondaire',
    idClassePedagogique: WORKFLOW_FIXTURES.classeA,
  }));

  await assert.rejects(() => adaptateur.verifierCreationAffectationClasse({
    idUtilisateur: enseignant.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idInscriptionScolaire: 'inscription-secondaire',
    idClassePedagogique: WORKFLOW_FIXTURES.classeA,
  }));

  await assert.rejects(() => adaptateur.verifierCreationAffectationClasse({
    idUtilisateur: administrateur.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idInscriptionScolaire: 'inscription-secondaire',
    idClassePedagogique: WORKFLOW_FIXTURES.classeA,
  }));

  await assert.rejects(() => adaptateur.verifierCreationAffectationClasse({
    idUtilisateur: directeurPrimaire.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idInscriptionScolaire: 'inscription-secondaire',
    idClassePedagogique: WORKFLOW_FIXTURES.classeA,
  }));

  await adaptateur.fermer();
});
