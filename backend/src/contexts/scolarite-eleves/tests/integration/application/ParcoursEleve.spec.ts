import assert from 'node:assert/strict';
import test from 'node:test';
import type { AutorisationParcoursElevePort } from '../../../application/ports';
import { HistorisationParcoursScolaire } from '../../../application/services/HistorisationParcoursScolaire';
import { ChangerStatutEleve } from '../../../application/use-cases/eleves/ChangerStatutEleve';
import { CreerInscriptionScolaire } from '../../../application/use-cases/inscriptions/CreerInscriptionScolaire';
import { ValiderInscriptionScolaire } from '../../../application/use-cases/inscriptions/ValiderInscriptionScolaire';
import { ConsulterParcoursEleve } from '../../../application/use-cases/parcours/ConsulterParcoursEleve';
import { ListerEvenementsParAnnee } from '../../../application/use-cases/parcours/ListerEvenementsParAnnee';
import { ReconstruireParcoursEleve } from '../../../application/use-cases/parcours/ReconstruireParcoursEleve';
import { AffectationClasse } from '../../../domain/aggregates/AffectationClasse';
import { Eleve } from '../../../domain/aggregates/Eleve';
import { InscriptionScolaire } from '../../../domain/aggregates/InscriptionScolaire';
import { ParcoursScolaireEleve } from '../../../domain/aggregates/ParcoursScolaireEleve';
import { EvenementParcours } from '../../../domain/entities/EvenementParcours';
import type { DepotEleve } from '../../../domain/repositories/DepotEleve';
import type { DepotAffectationClasse } from '../../../domain/repositories/DepotAffectationClasse';
import type { DepotInscriptionScolaire } from '../../../domain/repositories/DepotInscriptionScolaire';
import type { DepotParcoursScolaireEleve } from '../../../domain/repositories/DepotParcoursScolaireEleve';
import { OrigineInscription } from '../../../domain/value-objects/OrigineInscription';
import { EcoleProvenance } from '../../../domain/value-objects/EcoleProvenance';
import { SexeEleve } from '../../../domain/value-objects/SexeEleve';
import { StatutEleve } from '../../../domain/value-objects/StatutEleve';
import { TypeEvenementParcours } from '../../../domain/value-objects/TypeEvenementParcours';
import { idsScolariteTest } from '../../fixtures/eleves.fixture';

test('ConsulterParcoursEleve reapplique l autorisation locale avant lecture', async () => {
  const appels: string[] = [];
  const parcours = creerParcoursFixture('eleve-a', 'annee-2026');
  const depot: DepotParcoursScolaireEleve = creerDepotParcoursMemoire(new Map([
    ['eleve-a', parcours],
  ]));
  const autorisation: AutorisationParcoursElevePort = {
    async verifierConsultationParcoursEleve(params) { appels.push(`lecture:${params.idEleve}`); },
    async verifierReconstructionParcoursEleve() { appels.push('reconstruction'); },
    async listerSectionsLectureAutorisees() { return ['section-secondaire']; },
  };

  const sortie = await new ConsulterParcoursEleve(depot, autorisation).executer({
    idEleve: 'eleve-a',
    idOrganisation: idsScolariteTest.idOrganisation,
    idEcole: idsScolariteTest.idEcole,
    idUtilisateur: idsScolariteTest.idUtilisateur,
  });

  assert.equal(sortie.parcours.idEleve, 'eleve-a');
  assert.deepEqual(appels, ['lecture:eleve-a']);
});

test('ReconstruireParcoursEleve ne sauvegarde pas si l autorisation locale refuse', async () => {
  let sauvegardes = 0;
  const parcours = creerParcoursFixture('eleve-a', 'annee-2026');
  const depot: DepotParcoursScolaireEleve = {
    ...creerDepotParcoursMemoire(new Map([['eleve-a', parcours]])),
    async sauvegarder() { sauvegardes += 1; },
  };
  const autorisation: AutorisationParcoursElevePort = {
    async verifierConsultationParcoursEleve() {},
    async verifierReconstructionParcoursEleve() { throw new Error('ACCES_REFUSE'); },
    async listerSectionsLectureAutorisees() { return ['section-secondaire']; },
  };

  await assert.rejects(() => new ReconstruireParcoursEleve(depot, autorisation).executer({
    idEleve: 'eleve-a',
    idOrganisation: idsScolariteTest.idOrganisation,
    idEcole: idsScolariteTest.idEcole,
    idUtilisateur: idsScolariteTest.idUtilisateur,
  }), /ACCES_REFUSE/);

  assert.equal(sauvegardes, 0);
});

test('ListerEvenementsParAnnee filtre les parcours sur les sections autorisees', async () => {
  const parcoursA = creerParcoursFixture('eleve-a', 'annee-2026');
  const parcoursB = creerParcoursFixture('eleve-b', 'annee-2026');
  const depotParcours = creerDepotParcoursMemoire(new Map([
    ['eleve-a', parcoursA],
    ['eleve-b', parcoursB],
  ]));
  const depotInscription: DepotInscriptionScolaire = {
    async sauvegarder() {},
    async trouverParId() { return null; },
    async trouverInscriptionActiveParEleveEtAnnee() { return null; },
    async trouverDerniereInscriptionActiveParEleve() { return null; },
    async listerParAnnee() { return []; },
    async listerParClasse() { return []; },
    async listerParEcoleEtAnnee() {
      return [
        creerInscriptionFixture('inscription-a', 'eleve-a', 'annee-2026'),
        creerInscriptionFixture('inscription-b', 'eleve-b', 'annee-2026'),
      ];
    },
    async listerParOrganisationEtAnnee() { return []; },
    async existeInscriptionActiveParEleveEtAnnee() { return false; },
  };
  const depotAffectation: DepotAffectationClasse = {
    async sauvegarder() {},
    async trouverParId() { return null; },
    async trouverAffectationActiveParInscription(idInscriptionScolaire) {
      if (idInscriptionScolaire === 'inscription-a') {
        return creerAffectationFixture('affectation-a', 'inscription-a', 'classe-a');
      }

      return creerAffectationFixture('affectation-b', 'inscription-b', 'classe-b');
    },
    async listerActivesParClasse() { return []; },
    async listerActivesParEcole() { return []; },
    async desactiverAffectationActiveParInscription() {},
  };
  const autorisation: AutorisationParcoursElevePort = {
    async verifierConsultationParcoursEleve() {},
    async verifierReconstructionParcoursEleve() {},
    async listerSectionsLectureAutorisees() { return ['section-secondaire']; },
  };

  const sortie = await new ListerEvenementsParAnnee(
    depotParcours,
    depotInscription,
    depotAffectation,
    {
      async consulterSectionClasse({ idClassePedagogique }) {
        return idClassePedagogique === 'classe-a'
          ? {
            idSectionScolaire: 'section-secondaire',
            sectionCode: 'SECONDAIRE',
            sectionLibelle: 'Secondaire',
          }
          : {
            idSectionScolaire: 'section-primaire',
            sectionCode: 'PRIMAIRE',
            sectionLibelle: 'Primaire',
          };
      },
    },
    autorisation,
  ).executer({
    idAnneeScolaire: 'annee-2026',
    idOrganisation: idsScolariteTest.idOrganisation,
    idEcole: idsScolariteTest.idEcole,
    idUtilisateur: idsScolariteTest.idUtilisateur,
  });

  assert.equal(sortie.length, 1);
  assert.equal(sortie[0]?.referenceMetier, 'PARCOURS-eleve-a');
});

test('CreerInscriptionScolaire alimente le parcours avec un evenement INSCRIPTION', async () => {
  const depotParcours = creerDepotParcoursMemoire(new Map());
  const depotInscription = creerDepotInscriptionMemoire();
  const depotAffectation = creerDepotAffectationMemoire();
  const depotEleve = creerDepotEleveMemoire(new Map([
    ['eleve-a', creerEleveFixture('eleve-a')],
  ]));

  const historisation = new HistorisationParcoursScolaire(
    depotParcours,
    depotInscription,
    depotAffectation,
  );

  await new CreerInscriptionScolaire(
    depotInscription,
    depotEleve,
    undefined,
    historisation,
  ).executer({
    idOrganisation: idsScolariteTest.idOrganisation,
    idEcole: idsScolariteTest.idEcole,
    idUtilisateur: idsScolariteTest.idUtilisateur,
    idInscriptionScolaire: 'inscription-a',
    idEleve: 'eleve-a',
    idAnneeScolaire: 'annee-2026',
    dateInscription: '2026-09-01',
    origineInscription: OrigineInscription.NOUVEAU,
  });

  const historique = (await depotParcours.trouverParEleve('eleve-a'))?.listerHistorique() ?? [];
  assert.equal(historique.length, 1);
  assert.equal(historique[0]?.obtenirTypeEvenement(), TypeEvenementParcours.INSCRIPTION);
});

test('ValiderInscriptionScolaire alimente le parcours avec un evenement VALIDATION_INSCRIPTION', async () => {
  const depotParcours = creerDepotParcoursMemoire(new Map());
  const depotInscription = creerDepotInscriptionMemoire(new Map([
    ['inscription-a', creerInscriptionNonValideeFixture('inscription-a', 'eleve-a', 'annee-2026')],
  ]));
  const historisation = new HistorisationParcoursScolaire(
    depotParcours,
    depotInscription,
    creerDepotAffectationMemoire(),
  );

  await new ValiderInscriptionScolaire(
    depotInscription,
    undefined,
    historisation,
  ).executer({
    idOrganisation: idsScolariteTest.idOrganisation,
    idEcole: idsScolariteTest.idEcole,
    idUtilisateur: idsScolariteTest.idUtilisateur,
    idInscriptionScolaire: 'inscription-a',
    versionAttendue: 1,
  });

  const historique = (await depotParcours.trouverParEleve('eleve-a'))?.listerHistorique() ?? [];
  assert.equal(historique.at(-1)?.obtenirTypeEvenement(), TypeEvenementParcours.VALIDATION_INSCRIPTION);
});

test('ChangerStatutEleve alimente le parcours avec un evenement de cycle de vie', async () => {
  const depotParcours = creerDepotParcoursMemoire(new Map());
  const depotInscription = creerDepotInscriptionMemoire(new Map([
    ['inscription-a', creerInscriptionFixture('inscription-a', 'eleve-a', 'annee-2026')],
  ]));
  const depotAffectation = creerDepotAffectationMemoire(new Map([
    ['inscription-a', creerAffectationFixture('affectation-a', 'inscription-a', 'classe-a')],
  ]));
  const depotEleve = creerDepotEleveMemoire(new Map([
    ['eleve-a', creerEleveFixture('eleve-a')],
  ]));
  const historisation = new HistorisationParcoursScolaire(
    depotParcours,
    depotInscription,
    depotAffectation,
  );

  await new ChangerStatutEleve(
    depotEleve,
    undefined,
    undefined,
    historisation,
  ).executer({
    idOrganisation: idsScolariteTest.idOrganisation,
    idEcole: idsScolariteTest.idEcole,
    idUtilisateur: idsScolariteTest.idUtilisateur,
    idEleve: 'eleve-a',
    versionAttendue: 1,
    nouveauStatut: StatutEleve.ABANDONNE,
  });

  const historique = (await depotParcours.trouverParEleve('eleve-a'))?.listerHistorique() ?? [];
  assert.equal(historique.at(-1)?.obtenirTypeEvenement(), TypeEvenementParcours.ABANDON);
});

function creerParcoursFixture(idEleve: string, idAnneeScolaire: string): ParcoursScolaireEleve {
  const parcours = ParcoursScolaireEleve.creer(
    `parcours-${idEleve}`,
    idsScolariteTest.idOrganisation,
    idsScolariteTest.idEcole,
    idEleve,
  );
  parcours.enregistrerEvenement(EvenementParcours.creer({
    idEvenementParcours: `evenement-${idEleve}`,
    typeEvenement: TypeEvenementParcours.INSCRIPTION,
    dateEvenement: new Date('2026-09-01T00:00:00.000Z'),
    idAnneeScolaire,
    referenceMetier: `PARCOURS-${idEleve}`,
    declenchePar: idsScolariteTest.idUtilisateur,
  }));
  return parcours;
}

function creerDepotParcoursMemoire(
  parcoursParEleve: Map<string, ParcoursScolaireEleve>,
): DepotParcoursScolaireEleve {
  return {
    async sauvegarder(parcours) {
      parcoursParEleve.set(parcours.versProprietes().idEleve, parcours);
    },
    async trouverParEleve(idEleve) {
      return parcoursParEleve.get(idEleve) ?? null;
    },
    async listerParEleves(idsEleves) {
      return idsEleves.flatMap((idEleve) => {
        const parcours = parcoursParEleve.get(idEleve);
        return parcours === undefined ? [] : [parcours];
      });
    },
    async listerEvenementsParEleve(idEleve) {
      return parcoursParEleve.get(idEleve)?.listerHistorique() ?? [];
    },
    async listerEvenementsParAnnee(idAnneeScolaire) {
      return [...parcoursParEleve.values()].flatMap((parcours) => parcours.listerParAnnee(idAnneeScolaire));
    },
    async listerEvenementsParEcole() { return []; },
    async listerEvenementsParOrganisation() { return []; },
  };
}

function creerDepotInscriptionMemoire(
  inscriptions = new Map<string, InscriptionScolaire>(),
): DepotInscriptionScolaire {
  return {
    async sauvegarder(inscription) { inscriptions.set(inscription.obtenirId(), inscription); },
    async trouverParId(idInscriptionScolaire) { return inscriptions.get(idInscriptionScolaire) ?? null; },
    async trouverInscriptionActiveParEleveEtAnnee(idEleve, idAnneeScolaire) {
      return [...inscriptions.values()].find((inscription) =>
        inscription.obtenirIdEleve() === idEleve
        && inscription.obtenirIdAnneeScolaire() === idAnneeScolaire
        && inscription.estActive(),
      ) ?? null;
    },
    async trouverDerniereInscriptionActiveParEleve(idEleve) {
      return [...inscriptions.values()]
        .filter((inscription) => inscription.obtenirIdEleve() === idEleve && inscription.estActive())
        .at(-1) ?? null;
    },
    async listerParAnnee(idAnneeScolaire) {
      return [...inscriptions.values()].filter((inscription) => inscription.obtenirIdAnneeScolaire() === idAnneeScolaire);
    },
    async listerParClasse() { return []; },
    async listerParEcoleEtAnnee(idEcole, idAnneeScolaire) {
      return [...inscriptions.values()].filter((inscription) =>
        inscription.obtenirIdEcole() === idEcole
        && inscription.obtenirIdAnneeScolaire() === idAnneeScolaire,
      );
    },
    async listerParOrganisationEtAnnee(idOrganisation, idAnneeScolaire) {
      return [...inscriptions.values()].filter((inscription) =>
        inscription.obtenirIdOrganisation() === idOrganisation
        && inscription.obtenirIdAnneeScolaire() === idAnneeScolaire,
      );
    },
    async existeInscriptionActiveParEleveEtAnnee(idEleve, idAnneeScolaire) {
      return (await this.trouverInscriptionActiveParEleveEtAnnee(idEleve, idAnneeScolaire)) !== null;
    },
  };
}

function creerDepotAffectationMemoire(
  affectationsParInscription = new Map<string, AffectationClasse>(),
): DepotAffectationClasse {
  return {
    async sauvegarder(affectation) {
      affectationsParInscription.set(affectation.obtenirIdInscriptionScolaire(), affectation);
    },
    async trouverParId(idAffectationClasse) {
      return [...affectationsParInscription.values()].find((affectation) => affectation.obtenirId() === idAffectationClasse) ?? null;
    },
    async trouverAffectationActiveParInscription(idInscriptionScolaire) {
      return affectationsParInscription.get(idInscriptionScolaire) ?? null;
    },
    async listerActivesParClasse(idClassePedagogique) {
      return [...affectationsParInscription.values()].filter((affectation) => affectation.obtenirIdClassePedagogique() === idClassePedagogique);
    },
    async listerActivesParEcole(idEcole) {
      return [...affectationsParInscription.values()].filter((affectation) => affectation.obtenirIdEcole() === idEcole);
    },
    async desactiverAffectationActiveParInscription(idInscriptionScolaire, modifiePar) {
      const affectation = affectationsParInscription.get(idInscriptionScolaire);
      if (affectation) {
        affectation.desactiver(modifiePar);
      }
    },
  };
}

function creerDepotEleveMemoire(eleves = new Map<string, Eleve>()): DepotEleve {
  return {
    async sauvegarder(eleve) { eleves.set(eleve.obtenirId(), eleve); },
    async trouverParId(idEleve) { return eleves.get(idEleve) ?? null; },
    async trouverParMatricule() { return null; },
    async listerParEcole() { return [...eleves.values()]; },
    async listerParOrganisation() { return [...eleves.values()]; },
    async rechercherParIdentite() { return []; },
    async existeMatriculeDansEcole() { return false; },
    async existeDoublonProbable() { return false; },
    async trouverParFamille() { return []; },
  };
}

function creerInscriptionFixture(
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

function creerInscriptionNonValideeFixture(
  idInscriptionScolaire: string,
  idEleve: string,
  idAnneeScolaire: string,
): InscriptionScolaire {
  return InscriptionScolaire.creer({
    idInscriptionScolaire,
    idOrganisation: idsScolariteTest.idOrganisation,
    idEcole: idsScolariteTest.idEcole,
    idEleve,
    idAnneeScolaire,
    dateInscription: '2026-09-01',
    origineInscription: OrigineInscription.NOUVEAU,
    creePar: idsScolariteTest.idUtilisateur,
  });
}

function creerAffectationFixture(
  idAffectationClasse: string,
  idInscriptionScolaire: string,
  idClassePedagogique: string,
): AffectationClasse {
  return AffectationClasse.creer({
    idAffectationClasse,
    idOrganisation: idsScolariteTest.idOrganisation,
    idEcole: idsScolariteTest.idEcole,
    idInscriptionScolaire,
    idClassePedagogique,
    dateAffectation: '2026-09-02',
    creePar: idsScolariteTest.idUtilisateur,
  });
}

function creerEleveFixture(idEleve: string): Eleve {
  return Eleve.creer({
    idEleve,
    idOrganisation: idsScolariteTest.idOrganisation,
    idEcole: idsScolariteTest.idEcole,
    matricule: `MAT-${idEleve}`,
    nom: 'Mbuyi',
    postNom: 'Kalala',
    sexe: SexeEleve.F,
    dateNaissance: '2015-09-12',
    ecoleProvenance: EcoleProvenance.externe('Institut Mapendo'),
    creePar: idsScolariteTest.idUtilisateur,
  });
}
