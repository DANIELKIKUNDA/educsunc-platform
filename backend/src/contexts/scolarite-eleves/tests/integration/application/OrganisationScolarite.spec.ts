import assert from 'node:assert/strict';
import test from 'node:test';
import { ConsulterSyntheseScolariteOrganisation } from '../../../application/use-cases/organisation/ConsulterSyntheseScolariteOrganisation';
import { ListerAlertesScolariteOrganisation } from '../../../application/use-cases/organisation/ListerAlertesScolariteOrganisation';
import type { AutorisationOrganisationScolaritePort } from '../../../application/ports';
import { Eleve } from '../../../domain/aggregates/Eleve';
import { Famille } from '../../../domain/aggregates/Famille';
import { InscriptionScolaire } from '../../../domain/aggregates/InscriptionScolaire';
import type { DepotEleve } from '../../../domain/repositories/DepotEleve';
import type { DepotFamille } from '../../../domain/repositories/DepotFamille';
import type { DepotInscriptionScolaire } from '../../../domain/repositories/DepotInscriptionScolaire';
import { EcoleProvenance } from '../../../domain/value-objects/EcoleProvenance';
import { OrigineInscription } from '../../../domain/value-objects/OrigineInscription';
import { SexeEleve } from '../../../domain/value-objects/SexeEleve';
import { idsScolariteTest } from '../../fixtures/eleves.fixture';

test('ConsulterSyntheseScolariteOrganisation consolide les depots reels apres autorisation', async () => {
  const appels: Array<{ idUtilisateur: string; idOrganisation: string }> = [];
  const autorisation: AutorisationOrganisationScolaritePort = {
    async verifierLectureOrganisationScolarite(params) {
      appels.push(params);
    },
  };
  const eleveActif = creerEleveOrganisationFixture('eleve-actif', idsScolariteTest.idEcole);
  const eleveInactif = creerEleveOrganisationFixture('eleve-inactif', '33333333-3333-3333-3333-333333333333');
  eleveInactif.suspendre(idsScolariteTest.idUtilisateur);
  const famille = creerFamilleOrganisationFixture('famille-1', idsScolariteTest.idEcole);
  const inscriptionValidee = creerInscriptionOrganisationFixture('inscription-1', eleveActif.obtenirId(), 'annee-2026');

  const sortie = await new ConsulterSyntheseScolariteOrganisation(
    creerDepotEleveOrganisation([eleveActif, eleveInactif]),
    creerDepotFamilleOrganisation([famille]),
    creerDepotInscriptionOrganisation([inscriptionValidee]),
    autorisation,
  ).executer({
    idOrganisation: idsScolariteTest.idOrganisation,
    idUtilisateur: idsScolariteTest.idUtilisateur,
    idAnneeScolaire: 'annee-2026',
  });

  assert.deepEqual(appels, [{
    idUtilisateur: idsScolariteTest.idUtilisateur,
    idOrganisation: idsScolariteTest.idOrganisation,
  }]);
  assert.equal(sortie.totalEcoles, 2);
  assert.equal(sortie.totalEleves, 2);
  assert.equal(sortie.totalElevesActifs, 1);
  assert.equal(sortie.totalFamilles, 1);
  assert.equal(sortie.totalInscriptionsActives, 1);
});

test('ListerAlertesScolariteOrganisation remonte des alertes factuelles quand les donnees sont absentes ou inactives', async () => {
  const eleveInactif = creerEleveOrganisationFixture('eleve-inactif', idsScolariteTest.idEcole);
  eleveInactif.suspendre(idsScolariteTest.idUtilisateur);

  const alertes = await new ListerAlertesScolariteOrganisation(
    creerDepotEleveOrganisation([eleveInactif]),
    creerDepotFamilleOrganisation([]),
    creerDepotInscriptionOrganisation([]),
    {
      async verifierLectureOrganisationScolarite() {},
    },
  ).executer({
    idOrganisation: idsScolariteTest.idOrganisation,
    idUtilisateur: idsScolariteTest.idUtilisateur,
    idAnneeScolaire: 'annee-2026',
  });

  assert.deepEqual(alertes.map((alerte) => alerte.niveau), [
    'AVERTISSEMENT',
    'CRITIQUE',
    'AVERTISSEMENT',
  ]);
});

function creerDepotEleveOrganisation(eleves: Eleve[]): DepotEleve {
  return {
    async sauvegarder() {},
    async trouverParId(idEleve) {
      return eleves.find((eleve) => eleve.obtenirId() === idEleve) ?? null;
    },
    async trouverParMatricule() { return null; },
    async listerParEcole(idEcole) {
      return eleves.filter((eleve) => eleve.obtenirIdEcole() === idEcole);
    },
    async listerParOrganisation(idOrganisation) {
      return eleves.filter((eleve) => eleve.obtenirIdOrganisation() === idOrganisation);
    },
    async rechercherParIdentite() { return []; },
    async existeMatriculeDansEcole() { return false; },
    async existeDoublonProbable() { return false; },
    async trouverParFamille() { return []; },
  };
}

function creerDepotFamilleOrganisation(familles: Famille[]): DepotFamille {
  return {
    async sauvegarder() {},
    async trouverParId(idFamille) {
      return familles.find((famille) => famille.obtenirId() === idFamille) ?? null;
    },
    async trouverParCode(_idEcole, codeFamille) {
      return familles.find((famille) => famille.obtenirCodeFamille() === codeFamille) ?? null;
    },
    async listerParEcole(idEcole) {
      return familles.filter((famille) => famille.obtenirIdEcole() === idEcole);
    },
    async listerParOrganisation(idOrganisation) {
      return familles.filter((famille) => famille.obtenirIdOrganisation() === idOrganisation);
    },
    async existeCodeFamilleDansEcole() { return false; },
    async compterElevesActifsDeFamille() { return 0; },
  };
}

function creerDepotInscriptionOrganisation(inscriptions: InscriptionScolaire[]): DepotInscriptionScolaire {
  return {
    async sauvegarder() {},
    async trouverParId(idInscriptionScolaire) {
      return inscriptions.find((inscription) => inscription.obtenirId() === idInscriptionScolaire) ?? null;
    },
    async trouverInscriptionActiveParEleveEtAnnee(idEleve, idAnneeScolaire) {
      return inscriptions.find((inscription) =>
        inscription.obtenirIdEleve() === idEleve
        && inscription.obtenirIdAnneeScolaire() === idAnneeScolaire
        && inscription.estActive(),
      ) ?? null;
    },
    async trouverDerniereInscriptionActiveParEleve(idEleve) {
      return inscriptions.find((inscription) =>
        inscription.obtenirIdEleve() === idEleve && inscription.estActive(),
      ) ?? null;
    },
    async listerParAnnee(idAnneeScolaire) {
      return inscriptions.filter((inscription) => inscription.obtenirIdAnneeScolaire() === idAnneeScolaire);
    },
    async listerParClasse() { return []; },
    async listerParEcoleEtAnnee(idEcole, idAnneeScolaire) {
      return inscriptions.filter((inscription) =>
        inscription.obtenirIdEcole() === idEcole
        && inscription.obtenirIdAnneeScolaire() === idAnneeScolaire,
      );
    },
    async listerParOrganisationEtAnnee(idOrganisation, idAnneeScolaire) {
      return inscriptions.filter((inscription) =>
        inscription.obtenirIdOrganisation() === idOrganisation
        && inscription.obtenirIdAnneeScolaire() === idAnneeScolaire,
      );
    },
    async existeInscriptionActiveParEleveEtAnnee(idEleve, idAnneeScolaire) {
      return (await this.trouverInscriptionActiveParEleveEtAnnee(idEleve, idAnneeScolaire)) !== null;
    },
  };
}

function creerEleveOrganisationFixture(idEleve: string, idEcole: string): Eleve {
  return Eleve.creer({
    idEleve,
    idOrganisation: idsScolariteTest.idOrganisation,
    idEcole,
    matricule: `MAT-${idEleve}`,
    nom: 'Mbuyi',
    postNom: 'Kalala',
    prenom: 'Grace',
    sexe: SexeEleve.F,
    dateNaissance: '2015-09-12',
    ecoleProvenance: EcoleProvenance.externe('Institut Mapendo'),
    creePar: idsScolariteTest.idUtilisateur,
  });
}

function creerFamilleOrganisationFixture(idFamille: string, idEcole: string): Famille {
  return Famille.creer({
    idFamille,
    idOrganisation: idsScolariteTest.idOrganisation,
    idEcole,
    codeFamille: `FAM-${idFamille}`,
    nomFamille: 'Famille Mbuyi',
    telephonePrincipal: '+243810000000',
    responsables: [],
    creePar: idsScolariteTest.idUtilisateur,
  });
}

function creerInscriptionOrganisationFixture(
  idInscriptionScolaire: string,
  idEleve: string,
  idAnneeScolaire: string,
): InscriptionScolaire {
  const inscription = InscriptionScolaire.creer({
    idInscriptionScolaire,
    idOrganisation: idsScolariteTest.idOrganisation,
    idEcole: idsScolariteTest.idEcole,
    idEleve,
    idAnneeScolaire,
    dateInscription: '2026-09-01',
    origineInscription: OrigineInscription.NOUVEAU,
    creePar: idsScolariteTest.idUtilisateur,
  });
  inscription.valider(idsScolariteTest.idUtilisateur);
  return inscription;
}
