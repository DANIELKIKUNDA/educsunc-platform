import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationHistoriquePaiementsAdapter } from '../../../app/adapters/AutorisationHistoriquePaiementsAdapter';
import { ParametresPaiementEcole } from '../../../contexts/paiements-facturation/domain/aggregates/ParametresPaiementEcole';
import { ModePaiement } from '../../../contexts/paiements-facturation/domain/value-objects/ModePaiement';
import { PolitiqueArrieres } from '../../../contexts/paiements-facturation/domain/value-objects/PolitiqueArrieres';
import { ROLE_FIXTURES, TENANT_FIXTURES, WORKFLOW_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';

function creerParametresAvecConsultationDeleguee(): ParametresPaiementEcole {
  return new ParametresPaiementEcole({
    idParametresPaiementEcole: 'PARAM-HISTO-001',
    idEcole: TENANT_FIXTURES.ecoleA1,
    paiementPartielAutorise: false,
    politiqueArrieres: PolitiqueArrieres.AUTORISER_AVEC_SUIVI,
    autoriserInscriptionAvecDette: true,
    bloquerRetraitDocumentsSiDette: false,
    appliquerFamilleNombreuse: false,
    modesPaiementAutorises: [ModePaiement.CASH],
    exigerFraisInscription: false,
    consultationHistoriquePaiementsDeleguee: [
      'TITULAIRE',
      'PREFET_ETUDES',
      'DIRECTEUR_ETUDES',
      'DIRECTEUR_PRIMAIRE',
      'DIRECTEUR_MATERNELLE',
    ],
    actif: true,
    version: 1,
  });
}

test("SECURITY applique la doctrine locale de consultation d'historique des paiements", async () => {
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
  const adaptateur = new AutorisationHistoriquePaiementsAdapter();

  await assert.doesNotReject(() => adaptateur.verifierConsultationHistoriquePaiements({
    idUtilisateur: caissier.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.doesNotReject(() => adaptateur.verifierConsultationHistoriquePaiements({
    idUtilisateur: administrateur.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.doesNotReject(() => adaptateur.verifierConsultationHistoriquePaiements({
    idUtilisateur: gestionnaireOrganisation.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.doesNotReject(() => adaptateur.verifierConsultationHistoriquePaiements({
    idUtilisateur: promoteurOrganisation.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.rejects(() => adaptateur.verifierConsultationHistoriquePaiements({
    idUtilisateur: prefet.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));
});

test("SECURITY autorise une lecture pedagogique delegatee seulement si l'ecole la parametre", async () => {
  const bootstrap = new GlobalTestBootstrap();
  const titulaire = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ENSEIGNANT,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    titulaireClasseId: WORKFLOW_FIXTURES.classeA,
    titulaireAnneeScolaireId: WORKFLOW_FIXTURES.anneeScolaireId,
  });
  const enseignantSimple = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ENSEIGNANT,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const prefet = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.PREFET,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    sectionId: WORKFLOW_FIXTURES.sectionSecondaire,
  } as never);
  const directeurEtudes = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.DIRECTEUR_ETUDES,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    sectionId: WORKFLOW_FIXTURES.sectionSecondaire,
  } as never);
  const directeurPrimaire = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.DIRECTEUR_PRIMAIRE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    sectionId: WORKFLOW_FIXTURES.sectionPrimaire,
  } as never);
  const directeurMaternelle = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.DIRECTEUR_MATERNELLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    sectionId: WORKFLOW_FIXTURES.sectionMaternelle,
  } as never);

  const adaptateur = new AutorisationHistoriquePaiementsAdapter({
    async chargerParametresActifsParEcole() {
      return creerParametresAvecConsultationDeleguee();
    },
    async consulterClasseActiveEleve() {
      return {
        idClassePedagogique: WORKFLOW_FIXTURES.classeA,
        idEcole: TENANT_FIXTURES.ecoleA1,
        idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
      };
    },
    async resoudreSectionClasse() {
      return {
        idSectionScolaire: WORKFLOW_FIXTURES.sectionSecondaire,
        sectionCode: 'SECONDAIRE',
        sectionLibelle: 'Secondaire',
      };
    },
    async consulterResponsabiliteClassePedagogique() {
      return {
        idOrganisation: TENANT_FIXTURES.organisationA,
        idEcole: TENANT_FIXTURES.ecoleA1,
        idClassePedagogique: WORKFLOW_FIXTURES.classeA,
        idClasseAcademique: 'CLASSE-ACA-A',
        idSectionScolaire: WORKFLOW_FIXTURES.sectionSecondaire,
        sectionCode: 'SECONDAIRE',
        sectionLibelle: 'Secondaire',
        idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
        idUtilisateurEnseignant: titulaire.utilisateurId,
        active: true,
      };
    },
  });

  await assert.doesNotReject(() => adaptateur.verifierConsultationHistoriquePaiements({
    idUtilisateur: titulaire.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.rejects(() => adaptateur.verifierConsultationHistoriquePaiements({
    idUtilisateur: enseignantSimple.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.doesNotReject(() => adaptateur.verifierConsultationHistoriquePaiements({
    idUtilisateur: prefet.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.doesNotReject(() => adaptateur.verifierConsultationHistoriquePaiements({
    idUtilisateur: directeurEtudes.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.rejects(() => adaptateur.verifierConsultationHistoriquePaiements({
    idUtilisateur: directeurPrimaire.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.rejects(() => adaptateur.verifierConsultationHistoriquePaiements({
    idUtilisateur: directeurMaternelle.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));
});

test("SECURITY autorise un parent seulement si l'eleve est relie a son utilisateur authentifie", async () => {
  const bootstrap = new GlobalTestBootstrap();
  const parent = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.PARENT,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const adaptateur = new AutorisationHistoriquePaiementsAdapter({
    async consulterFamilleEleve(idEleve) {
      if (idEleve !== WORKFLOW_FIXTURES.eleveA) {
        return {
          idFamille: 'FAM-001',
          idEcole: TENANT_FIXTURES.ecoleA1,
          responsables: [{
            idResponsableFamille: 'RESP-002',
            idUtilisateurAuth: 'autre-parent',
            estPrincipal: true,
          }],
        };
      }

      return {
        idFamille: 'FAM-001',
        idEcole: TENANT_FIXTURES.ecoleA1,
        responsables: [{
          idResponsableFamille: 'RESP-001',
          idUtilisateurAuth: parent.utilisateurId,
          estPrincipal: true,
        }],
      };
    },
  });

  await assert.doesNotReject(() => adaptateur.verifierConsultationHistoriquePaiements({
    idUtilisateur: parent.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.rejects(() => adaptateur.verifierConsultationHistoriquePaiements({
    idUtilisateur: parent.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveB,
  }));
});
