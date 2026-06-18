import test from 'node:test';
import assert from 'node:assert/strict';
import type { AuditFinancierInput } from '../../../application/ports/AuditPort';
import type { AutorisationPerceptionPaiementPort } from '../../../application/ports/AutorisationPerceptionPaiementPort';
import type { DepotRecuPaiementOfficielPort, RecuPaiementOfficielPersistable } from '../../../application/ports/DepotRecuPaiementOfficielPort';
import type { ServiceNumeroRecuPaiementPort } from '../../../application/ports/ServiceNumeroRecuPaiementPort';
import type { EnregistrerPaiementInput } from '../../../application/dto/input/PaiementsEntreeDTO';
import type { PaiementEnregistreOutput } from '../../../application/dto/output/PaiementsSortieDTO';
import type {
  ClasseEleveDTO,
  ElevePaiementDTO,
  FamillePaiementDTO,
  InscriptionPaiementDTO,
  ScolariteElevesPort,
  StatutScolaireDTO,
} from '../../../application/ports/ScolariteElevesPort';
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
import type { DomainEventBusPort } from '../../../../../shared/application/DomainEventBusPort';

// Ce fichier teste l'orchestration applicative du cas d'usage d'enregistrement d'un paiement.

class DepotObligationMemoire implements DepotObligationFinanciere {
  public readonly sauvegardes: ObligationFinanciereEleve[] = [];
  public derniereLectureAnneeScolaire?: string;

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
    idAnneeScolaire: string,
  ): Promise<ObligationFinanciereEleve[]> {
    this.derniereLectureAnneeScolaire = idAnneeScolaire;
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

  public async trouverParId(idRecu: string): Promise<RecuPaiement | null> {
    return this.sauvegardes.find((recu) => recu.obtenirId() === idRecu) ?? null;
  }

  public async listerParPaiement(idPaiement: string): Promise<RecuPaiement[]> {
    return this.sauvegardes.filter((recu) => recu.obtenirIdPaiement() === idPaiement);
  }
}

class DepotRecuOfficielMemoire implements DepotRecuPaiementOfficielPort {
  public readonly sauvegardes: RecuPaiementOfficielPersistable[] = [];

  public async sauvegarder(recu: RecuPaiementOfficielPersistable): Promise<void> {
    this.sauvegardes.push(recu);
  }

  public async trouverParIdRecu(idRecu: string): Promise<RecuPaiementOfficielPersistable | null> {
    return this.sauvegardes.find((recu) => recu.idRecu === idRecu) ?? null;
  }

  public async trouverParPaiement(idPaiement: string): Promise<RecuPaiementOfficielPersistable | null> {
    return this.sauvegardes.find((recu) => recu.idPaiement === idPaiement) ?? null;
  }
}

class ServiceNumeroRecuMemoire implements ServiceNumeroRecuPaiementPort {
  public async generer(): Promise<string> {
    return 'ECOLE-2026-000001';
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
  public async trouverParPaiement(): Promise<null> { return null; }
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

class AutorisationPerceptionMemoire implements AutorisationPerceptionPaiementPort {
  public readonly appels: Array<{
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
    typeFrais: TypeFrais;
  }> = [];

  public async verifierPerceptionPaiement(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
    typeFrais: TypeFrais;
  }): Promise<void> {
    this.appels.push(params);
  }
}

class ScolaritePortMemoire implements ScolariteElevesPort {
  public async consulterEleve(idEleve: string): Promise<ElevePaiementDTO> {
    return { idEleve, idEcole: 'ECOLE-001', idOrganisation: 'ORG-001' };
  }

  public async consulterInscriptionActive(idEleve: string): Promise<InscriptionPaiementDTO | null> {
    return {
      idInscriptionScolaire: 'INSC-001',
      idEleve,
      idEcole: 'ECOLE-001',
      idAnneeScolaire: 'ANNEE-001',
    };
  }

  public async consulterClasseActiveEleve(): Promise<ClasseEleveDTO | null> { return null; }
  public async consulterFamilleEleve(): Promise<FamillePaiementDTO | null> { return null; }
  public async verifierStatutScolaire(idEleve: string): Promise<StatutScolaireDTO> {
    return { idEleve, statut: 'ACTIF', actif: true };
  }
}

class EventBusMemoire implements DomainEventBusPort {
  public readonly publications: string[][] = [];

  public async publier(evenements: { typeEvenement: string }[]): Promise<void> {
    this.publications.push(evenements.map((evenement) => evenement.typeEvenement));
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
    idOrganisation: 'ORG-001',
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
  const depotRecuOfficiel = new DepotRecuOfficielMemoire();
  const depotCaisse = new DepotCaisseMemoire(caisse);
  const depotRestitution = new DepotRestitutionMemoire();
  const storeIdempotence = new StoreIdempotenceMemoire();
  const audit = new AuditMemoire();
  const autorisation = new AutorisationPerceptionMemoire();
  const scolarite = new ScolaritePortMemoire();
  const eventBus = new EventBusMemoire();
  const casUsage = new EnregistrerPaiementUseCase(
    depotObligation,
    depotPaiement,
    depotParametres,
    depotRecu,
    depotCaisse,
    depotRestitution,
    new ServiceIdempotencePaiement(storeIdempotence),
    new ServiceTransactionPaiement(new UniteTravailImmediate()),
    autorisation,
    scolarite,
    depotRecuOfficiel,
    new ServiceNumeroRecuMemoire(),
    undefined,
    undefined,
    undefined,
    audit,
    eventBus,
  );

  return {
    casUsage,
    depotObligation,
    depotPaiement,
    depotRecu,
    depotRecuOfficiel,
    depotCaisse,
    audit,
    autorisation,
    scolarite,
    eventBus,
  };
}

test('EnregistrerPaiement repartit correctement un paiement exact sur une obligation', async () => {
  const obligation = creerObligation('OBL-001', 10_000);
  const { casUsage, depotPaiement, depotRecu, depotRecuOfficiel, audit } = creerCasUsage([obligation]);

  const sortie = await casUsage.executer(creerEntreePaiement(10_000));

  assert.equal(sortie.repartitions.length, 1);
  assert.equal(sortie.repartitions[0]?.montantAffecte.obtenirMontant(), 10_000);
  assert.equal(obligation.obtenirSolde().obtenirMontant(), 0);
  assert.equal(depotPaiement.sauvegardes.length, 1);
  assert.equal(depotRecu.sauvegardes.length, 1);
  assert.equal(depotRecuOfficiel.sauvegardes.length, 1);
  assert.equal(depotRecuOfficiel.sauvegardes[0]?.numeroRecu, 'ECOLE-2026-000001');
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
  const { casUsage, depotRecu, depotRecuOfficiel } = creerCasUsage([obligationA, obligationB]);

  const sortie = await casUsage.executer(creerEntreePaiement(12_000));

  assert.equal(sortie.repartitions.length, 2);
  assert.equal(sortie.repartitions[0]?.montantAffecte.obtenirMontant(), 10_000);
  assert.equal(sortie.repartitions[1]?.montantAffecte.obtenirMontant(), 2_000);
  assert.equal(obligationA.obtenirSolde().obtenirMontant(), 0);
  assert.equal(obligationB.obtenirSolde().obtenirMontant(), 4_000);
  assert.equal(depotRecu.sauvegardes.length, 2);
  assert.equal(depotRecu.sauvegardes[0]?.obtenirNumeroRecu(), 'ECOLE-2026-000001');
  assert.equal(depotRecu.sauvegardes[1]?.obtenirNumeroRecu(), 'ECOLE-2026-000001');
  assert.equal(depotRecuOfficiel.sauvegardes[0]?.lignes.length, 2);
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

test("EnregistrerPaiement reapplique l'autorisation locale avant la perception", async () => {
  const obligation = creerObligation('OBL-001', 10_000);
  const { casUsage, autorisation } = creerCasUsage([obligation]);

  await casUsage.executer(creerEntreePaiement(5_000));

  assert.equal(autorisation.appels.length, 1);
  assert.deepEqual(autorisation.appels[0], {
    idUtilisateur: 'CAISSIER-001',
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-001',
    typeFrais: TypeFrais.FRAIS_SCOLAIRES,
  });
});

test("EnregistrerPaiement utilise l'annee scolaire active pour charger les obligations", async () => {
  const obligation = creerObligation('OBL-001', 10_000);
  const { casUsage, depotObligation } = creerCasUsage([obligation]);

  await casUsage.executer(creerEntreePaiement(5_000));

  assert.equal(depotObligation.derniereLectureAnneeScolaire, 'ANNEE-001');
});

test('EnregistrerPaiement publie les evenements metier vers le bus partage', async () => {
  const obligation = creerObligation('OBL-001', 10_000);
  const { casUsage, eventBus } = creerCasUsage([obligation]);

  await casUsage.executer(creerEntreePaiement(10_000));

  assert.deepEqual(eventBus.publications, [[
    'PaiementCree',
    'PaiementReparti',
    'PaiementValide',
  ]]);
});
