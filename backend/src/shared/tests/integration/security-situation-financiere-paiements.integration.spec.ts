import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationSituationFinanciereEleveAdapter } from '../../../app/adapters/AutorisationSituationFinanciereEleveAdapter';
import { ParametresPaiementEcole } from '../../../contexts/paiements-facturation/domain/aggregates/ParametresPaiementEcole';
import { ModePaiement } from '../../../contexts/paiements-facturation/domain/value-objects/ModePaiement';
import { PolitiqueArrieres } from '../../../contexts/paiements-facturation/domain/value-objects/PolitiqueArrieres';
import { ROLE_FIXTURES, TENANT_FIXTURES, WORKFLOW_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';

function creerParametresAvecTitulaire(): ParametresPaiementEcole {
  return new ParametresPaiementEcole({
    idParametresPaiementEcole: 'PARAM-SITUATION-001',
    idEcole: TENANT_FIXTURES.ecoleA1,
    paiementPartielAutorise: false,
    politiqueArrieres: PolitiqueArrieres.AUTORISER_AVEC_SUIVI,
    autoriserInscriptionAvecDette: true,
    bloquerRetraitDocumentsSiDette: false,
    appliquerFamilleNombreuse: false,
    modesPaiementAutorises: [ModePaiement.CASH],
    exigerFraisInscription: false,
    consultationHistoriquePaiementsDeleguee: ['TITULAIRE'],
    actif: true,
    version: 1,
  });
}

test('SECURITY applique la meme doctrine PF-05 sur la situation financiere eleve', async () => {
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
  const adaptateur = new AutorisationSituationFinanciereEleveAdapter();

  await assert.doesNotReject(() => adaptateur.verifierConsultationSituationFinanciereEleve({
    idUtilisateur: caissier.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.doesNotReject(() => adaptateur.verifierConsultationSituationFinanciereEleve({
    idUtilisateur: administrateur.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.doesNotReject(() => adaptateur.verifierConsultationSituationFinanciereEleve({
    idUtilisateur: gestionnaireOrganisation.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.doesNotReject(() => adaptateur.verifierConsultationSituationFinanciereEleve({
    idUtilisateur: promoteurOrganisation.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.rejects(() => adaptateur.verifierConsultationSituationFinanciereEleve({
    idUtilisateur: prefet.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await adaptateur.fermer();
});

test("SECURITY autorise le titulaire sur la situation financiere seulement si l'ecole l'a parametre", async () => {
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

  const adaptateur = AutorisationSituationFinanciereEleveAdapter.avecDependancesTest({
    async chargerParametresActifsParEcole() {
      return creerParametresAvecTitulaire();
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

  await assert.doesNotReject(() => adaptateur.verifierConsultationSituationFinanciereEleve({
    idUtilisateur: titulaire.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.rejects(() => adaptateur.verifierConsultationSituationFinanciereEleve({
    idUtilisateur: enseignantSimple.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await adaptateur.fermer();
});
