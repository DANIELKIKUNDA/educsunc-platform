import test from 'node:test';
import assert from 'node:assert/strict';
import type { AuditFinancierInput } from '../../../application/ports/AuditPort';
import type { EnregistrerPaiementInput } from '../../../application/dto/input/PaiementsEntreeDTO';
import type { PaiementEnregistreOutput } from '../../../application/dto/output/PaiementsSortieDTO';
import { ServiceIdempotencePaiement, type EnregistrementIdempotencePaiement, type StoreIdempotencePaiement } from '../../../application/services/ServiceIdempotencePaiement';
import { ServiceTransactionPaiement, type UniteTravailPaiement } from '../../../application/services/ServiceTransactionPaiement';
import { EnregistrerPaiementUseCase } from '../../../application/use-cases/paiements/EnregistrerPaiementUseCase';
import { CaisseJour } from '../../../domain/aggregates/CaisseJour';
import { ObligationFinanciereEleve } from '../../../domain/aggregates/ObligationFinanciereEleve';
import { ParametresPaiementEcole } from '../../../domain/aggregates/ParametresPaiementEcole';
import { Paiement } from '../../../domain/aggregates/Paiement';
import { RecuPaiement } from '../../../domain/aggregates/RecuPaiement';
import type { DepotCaisseJour } from '../../../domain/repositories/DepotCaisseJour';
import type { DepotObligationFinanciere } from '../../../domain/repositories/DepotObligationFinanciere';
import type { DepotPaiement } from '../../../domain/repositories/DepotPaiement';
import type { DepotParametresPaiementEcole } from '../../../domain/repositories/DepotParametresPaiementEcole';
import type { DepotRecuPaiement } from '../../../domain/repositories/DepotRecuPaiement';
import type { DepotRestitution } from '../../../domain/repositories/DepotRestitution';
import { CiblePaiement } from '../../../domain/value-objects/CiblePaiement';
import { ModePaiement } from '../../../domain/value-objects/ModePaiement';
import { Money } from '../../../domain/value-objects/Money';
import { OrigineObligation } from '../../../domain/value-objects/OrigineObligation';
import { PolitiqueArrieres } from '../../../domain/value-objects/PolitiqueArrieres';
import { ReferenceFrais } from '../../../domain/value-objects/ReferenceFrais';
import { TypeFrais } from '../../../domain/value-objects/TypeFrais';

// Ce fichier teste l'orchestration applicative du cas d'usage d'enregistrement d'un paiement.

class DepotObligationMemoire implements DepotObligationFinanciere {
  public readonly sauvegardes: ObligationFinanciereEleve[] = [];

  constructor(private readonly obligations: ObligationFinanciereEleve[]) {}

  public async sauvegarder(obligation: ObligationFinanciereEleve): Promise<void> {
    this.sauvegardes.push(obligation);
  }

  public async trouverParId(idObligation: string): Promise<ObligationFinanciereEleve | null> {
    return this.obligations.find((obligation) => obligation.obtenirId() === idObligation) ?? null;
  }

  public async listerParEleveEtAnnee(
    _idEcole: string,
    _idEleve: string,
    _idAnneeScolaire: string,
  ): Promise<ObligationFinanciereEleve[]> {
    return this.obligations;
  }
}

class DepotPaiementMemoire implements DepotPaiement {
  public readonly sauvegardes: Paiement[] = [];

  public async sauvegarder(paiement: Paiement): Promise<void> {
    this.sauvegardes.push(paiement);
  }

  public async trouverParId(idPaiement: string): Promise<Paiement | null> {
    return this.sauvegardes.find((paiement) => paiement.obtenirId() === idPaiement) ?? null;
  }

  public async trouverParIdempotencyKey(
    idEcole: string,
    idempotencyKey: string,
  ): Promise<Paiement | null> {
    return this.sauvegardes.find((paiement) =>
      paiement.obtenirIdEcole() === idEcole
      && paiement.obtenirIdempotencyKey() === idempotencyKey,
    ) ?? null;
  }
}

class DepotParametresMemoire implements DepotParametresPaiementEcole {
  constructor(private readonly parametres: ParametresPaiementEcole | null) {}

  public async sauvegarder(_parametres: ParametresPaiementEcole): Promise<void> {}

  public async trouverParId(_idParametresPaiementEcole: string): Promise<ParametresPaiementEcole | null> {
    return this.parametres;
  }

  public async trouverActifParEcole(_idEcole: string): Promise<ParametresPaiementEcole | null> {
    return this.parametres;
  }
}

class DepotRecuMemoire implements DepotRecuPaiement {
  public readonly sauvegardes: RecuPaiement[] = [];

  public async sauvegarder(recu: RecuPaiement): Promise<void> {
    this.sauvegardes.push(recu);
  }

  public async listerParPaiement(idPaiement: string): Promise<RecuPaiement[]> {
    return this.sauvegardes.filter((recu) => recu.obtenirIdPaiement() === idPaiement);
  }
}

class DepotCaisseMemoire implements DepotCaisseJour {
  public readonly sauvegardes: CaisseJour[] = [];

  constructor(private readonly caisse: CaisseJour | null) {}

  public async sauvegarder(caisseJour: CaisseJour): Promise<void> {
    this.sauvegardes.push(caisseJour);
  }

  public async trouverParId(idCaisseJour: string): Promise<CaisseJour | null> {
    return this.caisse?.obtenirId() === idCaisseJour ? this.caisse : null;
  }

  public async trouverActiveParEcoleEtDate(
    _idEcole: string,
    _dateCaisse: string,
  ): Promise<CaisseJour | null> {
    return this.caisse;
  }
}

class DepotRestitutionMemoire implements DepotRestitution {
  public async sauvegarder(): Promise<void> {}
  public async trouverParId(): Promise<null> { return null; }
}

class StoreIdempotenceMemoire implements StoreIdempotencePaiement<PaiementEnregistreOutput> {
  private readonly donnees = new Map<string, EnregistrementIdempotencePaiement<PaiementEnregistreOutput>>();

  public async trouver(cleIdempotence: string): Promise<EnregistrementIdempotencePaiement<PaiementEnregistreOutput> | null> {
    return this.donnees.get(cleIdempotence) ?? null;
  }

  public async enregistrer(
    cleIdempotence: string,
    empreintePayload: string,
    sortie: PaiementEnregistreOutput,
  ): Promise<void> {
    this.donnees.set(cleIdempotence, {
      cleIdempotence,
      empreintePayload,
      sortie,
    });
  }
}

class UniteTravailImmediate implements UniteTravailPaiement {
  public async executerDansTransaction<TSortie>(operation: () => Promise<TSortie>): Promise<TSortie> {
    return operation();
  }
}

class AuditMemoire {
  public readonly entrees: AuditFinancierInput[] = [];

  public async journaliserActionFinanciere(input: AuditFinancierInput): Promise<void> {
    this.entrees.push(input);
  }
}

function creerObligation(id: string, montant: number, typeFrais = TypeFrais.FRAIS_SCOLAIRES): ObligationFinanciereEleve {
  return ObligationFinanciereEleve.creer({
    idObligation: id,
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-001',
    idAnneeScolaire: 'ANNEE-001',
    typeFrais,
    referenceFrais: new ReferenceFrais(id.replace(/-/g, '_')),
    libelle: `Obligation ${id}`,
    montantDuHistorique: new Money(montant, 'CDF'),
    origineCreation: OrigineObligation.GENERATION_INITIALE,
    creePar: 'UTIL-001',
  });
}

function creerParametres(): ParametresPaiementEcole {
  return new ParametresPaiementEcole({
    idParametresPaiementEcole: 'PARAM-001',
    idEcole: 'ECOLE-001',
    paiementPartielAutorise: true,
    paiementPartielParTypeFrais: new Map([[TypeFrais.FRAIS_SCOLAIRES, true]]),
    politiqueArrieres: PolitiqueArrieres.AUTORISER_AVEC_SUIVI,
    autoriserInscriptionAvecDette: true,
    bloquerRetraitDocumentsSiDette: false,
    appliquerFamilleNombreuse: false,
    modesPaiementAutorises: [ModePaiement.CASH, ModePaiement.MOBILE_MONEY],
    exigerFraisInscription: false,
    actif: true,
    version: 1,
  });
}

function creerCaisseOuverte(): CaisseJour {
  return CaisseJour.ouvrir({
    idCaisseJour: 'CAISSE-001',
    idEcole: 'ECOLE-001',
    dateCaisse: new Date().toISOString().slice(0, 10),
    ouvertePar: 'CAISSIER-001',
  });
}

function creerEntreePaiement(montant: number): EnregistrerPaiementInput {
  return {
    idEleve: 'ELEVE-001',
    idEcole: 'ECOLE-001',
    typeFraisDeclare: TypeFrais.FRAIS_SCOLAIRES,
    montant: new Money(montant, 'CDF'),
    modePaiement: ModePaiement.CASH,
    ciblePaiement: CiblePaiement.STANDARD,
    idempotencyKey: `KEY-${montant}`,
    idCaissier: 'CAISSIER-001',
  };
}

function creerCasUsage(
  obligations: ObligationFinanciereEleve[],
  caisse: CaisseJour | null = null,
) {
  const depotObligation = new DepotObligationMemoire(obligations);
  const depotPaiement = new DepotPaiementMemoire();
  const depotParametres = new DepotParametresMemoire(creerParametres());
  const depotRecu = new DepotRecuMemoire();
  const depotCaisse = new DepotCaisseMemoire(caisse);
  const depotRestitution = new DepotRestitutionMemoire();
  const storeIdempotence = new StoreIdempotenceMemoire();
  const audit = new AuditMemoire();
  const casUsage = new EnregistrerPaiementUseCase(
    depotObligation,
    depotPaiement,
    depotParametres,
    depotRecu,
    depotCaisse,
    depotRestitution,
    new ServiceIdempotencePaiement(storeIdempotence),
    new ServiceTransactionPaiement(new UniteTravailImmediate()),
    undefined,
    undefined,
    undefined,
    audit,
  );

  return {
    casUsage,
    depotObligation,
    depotPaiement,
    depotRecu,
    depotCaisse,
    audit,
  };
}

test('EnregistrerPaiement repartit correctement un paiement exact sur une obligation', async () => {
  const obligation = creerObligation('OBL-001', 10_000);
  const { casUsage, depotPaiement, depotRecu, audit } = creerCasUsage([obligation]);

  const sortie = await casUsage.executer(creerEntreePaiement(10_000));

  assert.equal(sortie.repartitions.length, 1);
  assert.equal(sortie.repartitions[0]?.montantAffecte.obtenirMontant(), 10_000);
  assert.equal(obligation.obtenirSolde().obtenirMontant(), 0);
  assert.equal(depotPaiement.sauvegardes.length, 1);
  assert.equal(depotRecu.sauvegardes.length, 1);
  assert.equal(audit.entrees.length, 1);
});

test('EnregistrerPaiement gere un paiement partiel et conserve le reste a payer', async () => {
  const obligation = creerObligation('OBL-001', 10_000);
  const { casUsage } = creerCasUsage([obligation]);

  const sortie = await casUsage.executer(creerEntreePaiement(4_000));

  assert.equal(sortie.repartitions.length, 1);
  assert.equal(sortie.repartitions[0]?.montantAffecte.obtenirMontant(), 4_000);
  assert.equal(obligation.obtenirMontantPaye().obtenirMontant(), 4_000);
  assert.equal(obligation.obtenirSolde().obtenirMontant(), 6_000);
});

test('EnregistrerPaiement repartit un paiement superieur sur plusieurs obligations', async () => {
  const obligationA = creerObligation('OBL-001', 10_000);
  const obligationB = creerObligation('OBL-002', 6_000);
  const { casUsage } = creerCasUsage([obligationA, obligationB]);

  const sortie = await casUsage.executer(creerEntreePaiement(12_000));

  assert.equal(sortie.repartitions.length, 2);
  assert.equal(sortie.repartitions[0]?.montantAffecte.obtenirMontant(), 10_000);
  assert.equal(sortie.repartitions[1]?.montantAffecte.obtenirMontant(), 2_000);
  assert.equal(obligationA.obtenirSolde().obtenirMontant(), 0);
  assert.equal(obligationB.obtenirSolde().obtenirMontant(), 4_000);
});

test('EnregistrerPaiement detecte un excedent non repartissable', async () => {
  const obligation = creerObligation('OBL-001', 5_000);
  const { casUsage } = creerCasUsage([obligation]);

  await assert.rejects(() => casUsage.executer(creerEntreePaiement(8_000)));
});

test('EnregistrerPaiement lie le paiement a une caisse ouverte quand elle existe', async () => {
  const obligation = creerObligation('OBL-001', 3_000);
  const caisse = creerCaisseOuverte();
  const { casUsage, depotCaisse } = creerCasUsage([obligation], caisse);

  await casUsage.executer(creerEntreePaiement(3_000));

  assert.equal(depotCaisse.sauvegardes.length, 1);
  assert.equal(caisse.obtenirOperations().length, 1);
  assert.equal(caisse.obtenirTotalEncaisse().obtenirMontant(), 3_000);
  assert.equal(caisse.obtenirTotalParCaissier().get('CAISSIER-001')?.obtenirMontant(), 3_000);
});
