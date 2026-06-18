import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationPaiementsParTypeFraisAdapter } from '../../../app/adapters/AutorisationPaiementsParTypeFraisAdapter';
import { ParametresPaiementEcole } from '../../../contexts/paiements-facturation/domain/aggregates/ParametresPaiementEcole';
import { ModePaiement } from '../../../contexts/paiements-facturation/domain/value-objects/ModePaiement';
import { PolitiqueArrieres } from '../../../contexts/paiements-facturation/domain/value-objects/PolitiqueArrieres';
import { ROLE_FIXTURES, TENANT_FIXTURES, WORKFLOW_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';

function creerParametresAvecConsultationDeleguee(): ParametresPaiementEcole {
  return new ParametresPaiementEcole({
    idParametresPaiementEcole: 'PARAM-FONDS-001',
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

test('SECURITY autorise la lecture des fonds anticipes seulement dans le perimetre pedagogique delegue', async () => {
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

  const adaptateur = new AutorisationPaiementsParTypeFraisAdapter({
    async chargerParametresActifsParEcole() {
      return creerParametresAvecConsultationDeleguee();
    },
    async listerClassesParSection(params) {
      return params.idSectionScolaire === WORKFLOW_FIXTURES.sectionSecondaire
        ? [WORKFLOW_FIXTURES.classeA]
        : [];
    },
    async listerElevesParClasses(params) {
      if (params.idsClasses.includes(WORKFLOW_FIXTURES.classeA)) {
        return ['ELEVE-A', 'ELEVE-B'];
      }
      return [];
    },
  });

  const lectureTitulaire = await adaptateur.resoudreConsultationFondsAnticipes({
    idUtilisateur: titulaire.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
  });
  assert.deepEqual(lectureTitulaire.idsElevesAutorises, ['ELEVE-A', 'ELEVE-B']);

  const lecturePrefet = await adaptateur.resoudreConsultationFondsAnticipes({
    idUtilisateur: prefet.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
  });
  assert.deepEqual(lecturePrefet.idsElevesAutorises, ['ELEVE-A', 'ELEVE-B']);
});
