import test from 'node:test';
import assert from 'node:assert/strict';
import { CreerInscriptionComplete } from '../../../application/use-cases/inscriptions/CreerInscriptionComplete';
import { CreerEleve } from '../../../application/use-cases/eleves/CreerEleve';
import { CreerInscriptionScolaire } from '../../../application/use-cases/inscriptions/CreerInscriptionScolaire';
import { ValiderInscriptionScolaire } from '../../../application/use-cases/inscriptions/ValiderInscriptionScolaire';
import { AffecterEleveAClasse } from '../../../application/use-cases/affectations/AffecterEleveAClasse';
import type { AutorisationInscriptionCompletePort } from '../../../application/ports';
import { OrchestrateurInscriptionEleve } from '../../../application/services/OrchestrateurInscriptionEleve';
import type { ServiceTransactionApplication } from '../../../application/services/ServiceTransactionApplication';
import type { StoreIdempotenceApplication, EnregistrementIdempotence } from '../../../application/services/ServiceApplicationIdempotence';
import { DepotEleveMemoire } from '../../utils/mockRepositories';
import type { DepotInscriptionScolaire } from '../../../domain/repositories/DepotInscriptionScolaire';
import type { DepotAffectationClasse } from '../../../domain/repositories/DepotAffectationClasse';
import type { InscriptionScolaire } from '../../../domain/aggregates/InscriptionScolaire';
import type { AffectationClasse } from '../../../domain/aggregates/AffectationClasse';
import { OrigineInscription } from '../../../domain/value-objects/OrigineInscription';
import { SexeEleve } from '../../../domain/value-objects/SexeEleve';
import { TypeProvenanceEcole } from '../../../domain/value-objects/TypeProvenanceEcole';
import { StatutInscription } from '../../../domain/value-objects/StatutInscription';

class DepotInscriptionMemoire implements DepotInscriptionScolaire {
  public readonly inscriptions = new Map<string, InscriptionScolaire>();

  public async sauvegarder(inscription: InscriptionScolaire): Promise<void> {
    this.inscriptions.set(inscription.obtenirId(), inscription);
  }

  public async trouverParId(idInscriptionScolaire: string): Promise<InscriptionScolaire | null> {
    return this.inscriptions.get(idInscriptionScolaire) ?? null;
  }

  public async trouverInscriptionActiveParEleveEtAnnee(idEleve: string, idAnneeScolaire: string): Promise<InscriptionScolaire | null> {
    return [...this.inscriptions.values()].find((inscription) =>
      inscription.obtenirIdEleve() === idEleve
      && inscription.obtenirIdAnneeScolaire() === idAnneeScolaire
      && inscription.estActive()) ?? null;
  }

  public async trouverDerniereInscriptionActiveParEleve(idEleve: string): Promise<InscriptionScolaire | null> {
    return [...this.inscriptions.values()]
      .filter((inscription) => inscription.obtenirIdEleve() === idEleve && inscription.estActive())
      .sort((a, b) => b.obtenirDateInscription().localeCompare(a.obtenirDateInscription()))[0] ?? null;
  }

  public async listerParAnnee(idAnneeScolaire: string): Promise<InscriptionScolaire[]> {
    return [...this.inscriptions.values()].filter((inscription) =>
      inscription.obtenirIdAnneeScolaire() === idAnneeScolaire);
  }

  public async listerParClasse(): Promise<InscriptionScolaire[]> {
    return [];
  }

  public async listerParEcoleEtAnnee(idEcole: string, idAnneeScolaire: string): Promise<InscriptionScolaire[]> {
    return [...this.inscriptions.values()].filter((inscription) =>
      inscription.obtenirIdEcole() === idEcole
      && inscription.obtenirIdAnneeScolaire() === idAnneeScolaire);
  }

  public async listerParOrganisationEtAnnee(idOrganisation: string, idAnneeScolaire: string): Promise<InscriptionScolaire[]> {
    return [...this.inscriptions.values()].filter((inscription) =>
      inscription.obtenirIdOrganisation() === idOrganisation
      && inscription.obtenirIdAnneeScolaire() === idAnneeScolaire);
  }

  public async existeInscriptionActiveParEleveEtAnnee(idEleve: string, idAnneeScolaire: string): Promise<boolean> {
    return (await this.trouverInscriptionActiveParEleveEtAnnee(idEleve, idAnneeScolaire)) !== null;
  }
}

class DepotAffectationMemoire implements DepotAffectationClasse {
  public readonly affectations = new Map<string, AffectationClasse>();

  public async sauvegarder(affectation: AffectationClasse): Promise<void> {
    this.affectations.set(affectation.obtenirId(), affectation);
  }

  public async trouverParId(idAffectationClasse: string): Promise<AffectationClasse | null> {
    return this.affectations.get(idAffectationClasse) ?? null;
  }

  public async trouverAffectationActiveParInscription(idInscriptionScolaire: string): Promise<AffectationClasse | null> {
    return [...this.affectations.values()].find((affectation) =>
      affectation.obtenirIdInscriptionScolaire() === idInscriptionScolaire
      && affectation.estActive()) ?? null;
  }

  public async listerActivesParClasse(idClassePedagogique: string): Promise<AffectationClasse[]> {
    return [...this.affectations.values()].filter((affectation) =>
      affectation.obtenirIdClassePedagogique() === idClassePedagogique
      && affectation.estActive());
  }

  public async listerActivesParEcole(idEcole: string): Promise<AffectationClasse[]> {
    return [...this.affectations.values()].filter((affectation) =>
      affectation.obtenirIdEcole() === idEcole
      && affectation.estActive());
  }

  public async desactiverAffectationActiveParInscription(idInscriptionScolaire: string, modifiePar: string): Promise<void> {
    const affectation = await this.trouverAffectationActiveParInscription(idInscriptionScolaire);
    affectation?.desactiver(modifiePar);
  }
}

class AutorisationInscriptionCompleteMemoire implements AutorisationInscriptionCompletePort {
  public appels = 0;

  public async verifierCreationInscriptionComplete(): Promise<void> {
    this.appels += 1;
  }
}

class TransactionMemoire implements ServiceTransactionApplication {
  public appels = 0;

  public async executerDansTransaction<TValeur>(operation: () => Promise<TValeur>): Promise<TValeur> {
    this.appels += 1;
    return operation();
  }
}

class StoreIdempotenceMemoire
  implements StoreIdempotenceApplication<{ donnee: Awaited<ReturnType<CreerInscriptionComplete['executer']>> }>
{
  public readonly donnees = new Map<string, EnregistrementIdempotence<{ donnee: Awaited<ReturnType<CreerInscriptionComplete['executer']>> }>>();

  public async trouver(cleIdempotence: string) {
    return this.donnees.get(cleIdempotence) ?? null;
  }

  public async enregistrer(
    cleIdempotence: string,
    empreintePayload: string,
    sortie: { donnee: Awaited<ReturnType<CreerInscriptionComplete['executer']>> },
  ) {
    this.donnees.set(cleIdempotence, {
      cleIdempotence,
      empreintePayload,
      sortie,
    });
  }
}

const entreeComplete = {
  eleve: {
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idempotencyKey: 'idem-1',
    idEleve: 'eleve-1',
    matricule: 'EL-001',
    nom: 'Mbuyi',
    postNom: 'Kalala',
    prenom: 'Grace',
    sexe: SexeEleve.F,
    dateNaissance: '2015-09-12',
    typeProvenance: TypeProvenanceEcole.EXTERNE,
    nomEcoleProvenance: 'Institut Mapendo',
  },
  inscription: {
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idempotencyKey: 'idem-1',
    idInscriptionScolaire: 'inscription-1',
    idEleve: 'eleve-1',
    idAnneeScolaire: 'annee-2026',
    dateInscription: '2026-09-01',
    origineInscription: OrigineInscription.NOUVEAU,
  },
  affectation: {
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idempotencyKey: 'idem-1',
    idAffectationClasse: 'affectation-1',
    idInscriptionScolaire: 'inscription-1',
    idClassePedagogique: 'classe-1',
    dateAffectation: '2026-09-02',
  },
};

test('CreerInscriptionComplete orchestre creation validation et affectation dans une transaction', async () => {
  const depotEleve = new DepotEleveMemoire();
  const depotInscription = new DepotInscriptionMemoire();
  const depotAffectation = new DepotAffectationMemoire();
  const autorisation = new AutorisationInscriptionCompleteMemoire();
  const transaction = new TransactionMemoire();

  const useCase = new CreerInscriptionComplete(
    new CreerEleve(depotEleve),
    new CreerInscriptionScolaire(depotInscription, depotEleve),
    new ValiderInscriptionScolaire(depotInscription),
    new AffecterEleveAClasse(depotAffectation, depotInscription),
    autorisation,
    transaction,
  );

  const sortie = await useCase.executer(entreeComplete);

  assert.equal(autorisation.appels, 1);
  assert.equal(transaction.appels, 1);
  assert.equal(sortie.eleve.idEleve, 'eleve-1');
  assert.equal(sortie.inscription.idInscriptionScolaire, 'inscription-1');
  assert.equal(sortie.inscription.statutInscription, StatutInscription.VALIDEE);
  assert.equal(sortie.affectation?.idAffectationClasse, 'affectation-1');
  assert.equal(depotEleve.eleves.size, 1);
  assert.equal(depotInscription.inscriptions.size, 1);
  assert.equal(depotAffectation.affectations.size, 1);
});

test('CreerInscriptionComplete refuse un payload incoherent', async () => {
  const useCase = new CreerInscriptionComplete(
    new CreerEleve(new DepotEleveMemoire()),
    new CreerInscriptionScolaire(new DepotInscriptionMemoire(), new DepotEleveMemoire()),
  );

  await assert.rejects(
    () => useCase.executer({
      ...entreeComplete,
      inscription: {
        ...entreeComplete.inscription,
        idEleve: 'autre-eleve',
      },
    }),
  );
});

test('OrchestrateurInscriptionEleve rejoue le meme resultat pour la meme cle idempotente', async () => {
  const depotEleve = new DepotEleveMemoire();
  const depotInscription = new DepotInscriptionMemoire();
  const depotAffectation = new DepotAffectationMemoire();
  const autorisation = new AutorisationInscriptionCompleteMemoire();
  const transaction = new TransactionMemoire();
  const store = new StoreIdempotenceMemoire();

  const useCase = new CreerInscriptionComplete(
    new CreerEleve(depotEleve),
    new CreerInscriptionScolaire(depotInscription, depotEleve),
    new ValiderInscriptionScolaire(depotInscription),
    new AffecterEleveAClasse(depotAffectation, depotInscription),
    autorisation,
    transaction,
  );
  const orchestrateur = new OrchestrateurInscriptionEleve(useCase, store);

  const premiereSortie = await orchestrateur.executer(entreeComplete);
  const deuxiemeSortie = await orchestrateur.executer(entreeComplete);

  assert.deepEqual(deuxiemeSortie, premiereSortie);
  assert.equal(transaction.appels, 1);
  assert.equal(autorisation.appels, 1);
  assert.equal(store.donnees.size, 1);
});
