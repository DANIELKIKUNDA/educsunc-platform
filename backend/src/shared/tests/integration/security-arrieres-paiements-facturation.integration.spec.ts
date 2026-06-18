import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationSituationFinanciereEleveAdapter } from '../../../app/adapters/AutorisationSituationFinanciereEleveAdapter';
import { ParametresPaiementEcole } from '../../../contexts/paiements-facturation/domain/aggregates/ParametresPaiementEcole';
import { ModePaiement } from '../../../contexts/paiements-facturation/domain/value-objects/ModePaiement';
import { PolitiqueArrieres } from '../../../contexts/paiements-facturation/domain/value-objects/PolitiqueArrieres';
import { ROLE_FIXTURES, TENANT_FIXTURES, WORKFLOW_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';

function creerParametresAvecLectureDelegueeComplete(): ParametresPaiementEcole {
  return new ParametresPaiementEcole({
    idParametresPaiementEcole: 'PARAM-ARRIERES-001',
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

test('SECURITY applique sur PF-15 la meme doctrine d acteurs que PF-14', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const titulaire = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ENSEIGNANT,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    titulaireClasseId: WORKFLOW_FIXTURES.classeA,
    titulaireAnneeScolaireId: WORKFLOW_FIXTURES.anneeScolaireId,
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

  const adaptateur = AutorisationSituationFinanciereEleveAdapter.avecDependancesTest({
    async chargerParametresActifsParEcole() {
      return creerParametresAvecLectureDelegueeComplete();
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

  await assert.doesNotReject(() => adaptateur.verifierConsultationSituationFinanciereEleve({
    idUtilisateur: prefet.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.doesNotReject(() => adaptateur.verifierConsultationSituationFinanciereEleve({
    idUtilisateur: directeurEtudes.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await adaptateur.fermer();
});
