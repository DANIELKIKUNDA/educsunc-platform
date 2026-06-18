import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationExonerationAdapter } from '../../../app/adapters/AutorisationExonerationAdapter';
import { ParametresPaiementEcole } from '../../../contexts/paiements-facturation/domain/aggregates/ParametresPaiementEcole';
import { ModePaiement } from '../../../contexts/paiements-facturation/domain/value-objects/ModePaiement';
import { PolitiqueArrieres } from '../../../contexts/paiements-facturation/domain/value-objects/PolitiqueArrieres';
import { ROLE_FIXTURES, TENANT_FIXTURES, WORKFLOW_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';

function creerParametresAvecExonerationDeleguee(): ParametresPaiementEcole {
  return new ParametresPaiementEcole({
    idParametresPaiementEcole: 'PARAM-EXO-001',
    idEcole: TENANT_FIXTURES.ecoleA1,
    paiementPartielAutorise: false,
    politiqueArrieres: PolitiqueArrieres.AUTORISER_AVEC_SUIVI,
    autoriserInscriptionAvecDette: true,
    bloquerRetraitDocumentsSiDette: false,
    appliquerFamilleNombreuse: false,
    modesPaiementAutorises: [ModePaiement.CASH],
    exigerFraisInscription: false,
    exonerationDeleguee: ['SECRETAIRE'],
    actif: true,
    version: 1,
  });
}

test("SECURITY autorise l'administration locale et organisationnelle sur PF-18", async () => {
  const bootstrap = new GlobalTestBootstrap();
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
  const adaptateur = new AutorisationExonerationAdapter();

  await assert.doesNotReject(() => adaptateur.verifierGestionExoneration({
    idUtilisateur: administrateur.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.doesNotReject(() => adaptateur.verifierGestionExoneration({
    idUtilisateur: gestionnaireOrganisation.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.doesNotReject(() => adaptateur.verifierGestionExoneration({
    idUtilisateur: promoteurOrganisation.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));
});

test("SECURITY n'autorise le secrétaire sur PF-18 que si l'école le paramètre", async () => {
  const bootstrap = new GlobalTestBootstrap();
  const secretaire = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.SECRETAIRE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const secretaireAutreEcole = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.SECRETAIRE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA2,
  });
  const adaptateurAvecDelegation = new AutorisationExonerationAdapter({
    async chargerParametresActifsParEcole() {
      return creerParametresAvecExonerationDeleguee();
    },
  });
  const adaptateurSansDelegation = new AutorisationExonerationAdapter({
    async chargerParametresActifsParEcole() {
      return null;
    },
  });

  await assert.doesNotReject(() => adaptateurAvecDelegation.verifierGestionExoneration({
    idUtilisateur: secretaire.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.rejects(() => adaptateurSansDelegation.verifierGestionExoneration({
    idUtilisateur: secretaire.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));

  await assert.rejects(() => adaptateurAvecDelegation.verifierGestionExoneration({
    idUtilisateur: secretaireAutreEcole.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
  }));
});
