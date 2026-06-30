import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationPerceptionPaiementAdapter } from '../../../app/adapters/AutorisationPerceptionPaiementAdapter';
import { ParametresPaiementEcole } from '../../../contexts/paiements-facturation/domain/aggregates/ParametresPaiementEcole';
import { ModePaiement } from '../../../contexts/paiements-facturation/domain/value-objects/ModePaiement';
import { PolitiqueArrieres } from '../../../contexts/paiements-facturation/domain/value-objects/PolitiqueArrieres';
import { TypeFrais } from '../../../contexts/paiements-facturation/domain/value-objects/TypeFrais';
import { ROLE_FIXTURES, TENANT_FIXTURES, WORKFLOW_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';

function creerParametresDelegues(): ParametresPaiementEcole {
  return new ParametresPaiementEcole({
    idParametresPaiementEcole: 'PARAM-001',
    idEcole: TENANT_FIXTURES.ecoleA1,
    paiementPartielAutorise: true,
    politiqueArrieres: PolitiqueArrieres.AUTORISER_AVEC_SUIVI,
    autoriserInscriptionAvecDette: true,
    bloquerRetraitDocumentsSiDette: false,
    appliquerFamilleNombreuse: false,
    modesPaiementAutorises: [ModePaiement.CASH],
    exigerFraisInscription: false,
    actif: true,
    version: 1,
    perceptionDelegueeParTypeFrais: new Map([
      [TypeFrais.FRAIS_PARTICIPATION_EXETAT, ['PREFET_ETUDES']],
      [TypeFrais.FRAIS_INSCRIPTION, ['DIRECTEUR_PRIMAIRE']],
      [TypeFrais.FRAIS_BULLETIN, ['DIRECTEUR_MATERNELLE']],
    ]),
  });
}

test('SECURITY applique la doctrine locale de perception des paiements', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const caissier = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.CAISSIER,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const prefet = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.PREFET,
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
  const enseignant = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ENSEIGNANT,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    sectionId: WORKFLOW_FIXTURES.sectionSecondaire,
  });
  const prefetLectureSeulement = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.PREFET,
    permissions: ROLE_FIXTURES.PREFET.permissions.filter((permission) => permission !== 'paiements.write'),
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    sectionId: WORKFLOW_FIXTURES.sectionSecondaire,
  });
  const administrateur = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const adaptateurSecondaire = new AutorisationPerceptionPaiementAdapter({
    async chargerParametresActifsParEcole() {
      return creerParametresDelegues();
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
  });

  await assert.doesNotReject(() => adaptateurSecondaire.verifierPerceptionPaiement({
    idUtilisateur: caissier.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
    typeFrais: TypeFrais.FRAIS_MINERVAL,
  }));

  await assert.doesNotReject(() => adaptateurSecondaire.verifierPerceptionPaiement({
    idUtilisateur: administrateur.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
    typeFrais: TypeFrais.FRAIS_MINERVAL,
  }));

  await assert.doesNotReject(() => adaptateurSecondaire.verifierPerceptionPaiement({
    idUtilisateur: prefet.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
    typeFrais: TypeFrais.FRAIS_PARTICIPATION_EXETAT,
  }));

  await assert.rejects(() => adaptateurSecondaire.verifierPerceptionPaiement({
    idUtilisateur: prefet.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
    typeFrais: TypeFrais.FRAIS_MINERVAL,
  }));

  await assert.rejects(() => adaptateurSecondaire.verifierPerceptionPaiement({
    idUtilisateur: enseignant.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
    typeFrais: TypeFrais.FRAIS_PARTICIPATION_EXETAT,
  }));

  await assert.rejects(() => adaptateurSecondaire.verifierPerceptionPaiement({
    idUtilisateur: prefetLectureSeulement.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
    typeFrais: TypeFrais.FRAIS_PARTICIPATION_EXETAT,
  }));

  const adaptateurPrimaire = new AutorisationPerceptionPaiementAdapter({
    async chargerParametresActifsParEcole() {
      return creerParametresDelegues();
    },
    async consulterClasseActiveEleve() {
      return {
        idClassePedagogique: 'classe-primaire',
        idEcole: TENANT_FIXTURES.ecoleA1,
        idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
      };
    },
    async resoudreSectionClasse() {
      return {
        idSectionScolaire: WORKFLOW_FIXTURES.sectionPrimaire,
        sectionCode: 'PRIMAIRE',
        sectionLibelle: 'Primaire',
      };
    },
  });

  await assert.doesNotReject(() => adaptateurPrimaire.verifierPerceptionPaiement({
    idUtilisateur: directeurPrimaire.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
    typeFrais: TypeFrais.FRAIS_INSCRIPTION,
  }));

  const adaptateurMaternelle = new AutorisationPerceptionPaiementAdapter({
    async chargerParametresActifsParEcole() {
      return creerParametresDelegues();
    },
    async consulterClasseActiveEleve() {
      return {
        idClassePedagogique: 'classe-maternelle',
        idEcole: TENANT_FIXTURES.ecoleA1,
        idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
      };
    },
    async resoudreSectionClasse() {
      return {
        idSectionScolaire: WORKFLOW_FIXTURES.sectionMaternelle,
        sectionCode: 'MATERNELLE',
        sectionLibelle: 'Maternelle',
      };
    },
  });

  await assert.doesNotReject(() => adaptateurMaternelle.verifierPerceptionPaiement({
    idUtilisateur: directeurMaternelle.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
    typeFrais: TypeFrais.FRAIS_BULLETIN,
  }));

  await adaptateurSecondaire.fermer();
  await adaptateurPrimaire.fermer();
  await adaptateurMaternelle.fermer();
});
