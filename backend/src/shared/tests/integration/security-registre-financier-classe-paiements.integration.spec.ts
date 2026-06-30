import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationRegistreFinancierClasseAdapter } from '../../../app/adapters/AutorisationRegistreFinancierClasseAdapter';
import { ParametresPaiementEcole } from '../../../contexts/paiements-facturation/domain/aggregates/ParametresPaiementEcole';
import { ModePaiement } from '../../../contexts/paiements-facturation/domain/value-objects/ModePaiement';
import { PolitiqueArrieres } from '../../../contexts/paiements-facturation/domain/value-objects/PolitiqueArrieres';
import { ROLE_FIXTURES, TENANT_FIXTURES, WORKFLOW_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';

function creerParametresAvecLectureDeleguee(): ParametresPaiementEcole {
  return new ParametresPaiementEcole({
    idParametresPaiementEcole: 'PARAM-REG-001',
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

test('SECURITY applique la doctrine registre financier de classe avec perimetre reel de classe et de section', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const caissier = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.CAISSIER,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
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
  const enseignantSimple = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ENSEIGNANT,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const adaptateur = new AutorisationRegistreFinancierClasseAdapter({
    async chargerParametresActifsParEcole() {
      return creerParametresAvecLectureDeleguee();
    },
    async consulterResponsabiliteClassePedagogique({ idClassePedagogique, idAnneeScolaire }) {
      if (
        idClassePedagogique === WORKFLOW_FIXTURES.classeA
        && idAnneeScolaire === WORKFLOW_FIXTURES.anneeScolaireId
      ) {
        return {
          idOrganisation: TENANT_FIXTURES.organisationA,
          idEcole: TENANT_FIXTURES.ecoleA1,
          idClassePedagogique: WORKFLOW_FIXTURES.classeA,
          idClasseAcademique: 'classe-academique-a',
          idSectionScolaire: WORKFLOW_FIXTURES.sectionSecondaire,
          sectionCode: 'SECONDAIRE',
          sectionLibelle: 'Secondaire',
          idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
          idUtilisateurEnseignant: titulaire.utilisateurId,
          active: true,
        };
      }

      return null;
    },
    async listerClassesParSection(params) {
      return params.idSectionScolaire === WORKFLOW_FIXTURES.sectionSecondaire
        ? [WORKFLOW_FIXTURES.classeA]
        : [];
    },
  });

  await assert.doesNotReject(() => adaptateur.verifierConsultationRegistreFinancierClasse({
    idUtilisateur: caissier.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idClassePedagogique: WORKFLOW_FIXTURES.classeA,
    idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
  }));

  await assert.doesNotReject(() => adaptateur.verifierConsultationRegistreFinancierClasse({
    idUtilisateur: titulaire.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idClassePedagogique: WORKFLOW_FIXTURES.classeA,
    idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
  }));

  await assert.rejects(() => adaptateur.verifierConsultationRegistreFinancierClasse({
    idUtilisateur: titulaire.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idClassePedagogique: WORKFLOW_FIXTURES.classeB,
    idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
  }));

  await assert.doesNotReject(() => adaptateur.verifierConsultationRegistreFinancierClasse({
    idUtilisateur: prefet.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idClassePedagogique: WORKFLOW_FIXTURES.classeA,
    idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
  }));

  await assert.rejects(() => adaptateur.verifierConsultationRegistreFinancierClasse({
    idUtilisateur: enseignantSimple.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idClassePedagogique: WORKFLOW_FIXTURES.classeA,
    idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
  }));

  await adaptateur.fermer();
});
