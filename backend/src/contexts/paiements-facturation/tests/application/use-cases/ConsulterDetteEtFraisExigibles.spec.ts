import test from 'node:test';
import assert from 'node:assert/strict';
import type {
  ClasseEleveDTO,
  ElevePaiementDTO,
  FamillePaiementDTO,
  InscriptionPaiementDTO,
  ScolariteElevesPort,
  StatutScolaireDTO,
} from '../../../application/ports/ScolariteElevesPort';
import { ConsulterDetteEleveUseCase } from '../../../application/use-cases/dettes/ConsulterDetteEleveUseCase';
import { ConsulterFraisExigiblesEleveUseCase } from '../../../application/use-cases/dettes/ConsulterFraisExigiblesEleveUseCase';
import { DetteEleve } from '../../../domain/aggregates/DetteEleve';
import { ObligationFinanciereEleve } from '../../../domain/aggregates/ObligationFinanciereEleve';
import { ParametresPaiementEcole } from '../../../domain/aggregates/ParametresPaiementEcole';
import { DetteAnnuelle } from '../../../domain/entities/DetteAnnuelle';
import { LigneDette } from '../../../domain/entities/LigneDette';
import type { DepotDetteEleve } from '../../../domain/repositories/DepotDetteEleve';
import type { DepotObligationFinanciere } from '../../../domain/repositories/DepotObligationFinanciere';
import type { DepotParametresPaiementEcole } from '../../../domain/repositories/DepotParametresPaiementEcole';
import { Money } from '../../../domain/value-objects/Money';
import { ModePaiement } from '../../../domain/value-objects/ModePaiement';
import { OrigineAffectation } from '../../../domain/value-objects/OrigineAffectation';
import { OrigineObligation } from '../../../domain/value-objects/OrigineObligation';
import { PolitiqueArrieres } from '../../../domain/value-objects/PolitiqueArrieres';
import { ReferenceFrais } from '../../../domain/value-objects/ReferenceFrais';
import { StatutDette } from '../../../domain/value-objects/StatutDette';
import { TypeFrais } from '../../../domain/value-objects/TypeFrais';
import type { AutorisationSituationFinanciereElevePort } from '../../../application/ports/AutorisationSituationFinanciereElevePort';

// Ce fichier teste les lectures applicatives de dette eleve et de frais exigibles.

class DepotDetteMemoire implements DepotDetteEleve {
  public dernierIdEcole?: string;

  constructor(private readonly dette: DetteEleve | null) {}

  public async sauvegarder(_dette: DetteEleve): Promise<void> {}

  public async trouverParEleve(idEcole: string, _idEleve: string): Promise<DetteEleve | null> {
    this.dernierIdEcole = idEcole;
    return this.dette;
  }
}

class DepotObligationsMemoire implements DepotObligationFinanciere {
  constructor(private readonly obligations: ObligationFinanciereEleve[]) {}

  public async sauvegarder(_obligation: ObligationFinanciereEleve): Promise<void> {}

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

class DepotParametresMemoire implements DepotParametresPaiementEcole {
  constructor(private readonly parametres: ParametresPaiementEcole | null) {}

  public async sauvegarder(_parametres: ParametresPaiementEcole): Promise<void> {}
  public async trouverParId(): Promise<ParametresPaiementEcole | null> { return this.parametres; }
  public async trouverActifParEcole(): Promise<ParametresPaiementEcole | null> { return this.parametres; }
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

class AutorisationSituationFinanciereMemoire
  implements AutorisationSituationFinanciereElevePort
{
  public appels: Array<{
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
  }> = [];

  public async verifierConsultationSituationFinanciereEleve(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
  }): Promise<void> {
    this.appels.push(params);
  }
}

function creerParametres(): ParametresPaiementEcole {
  return new ParametresPaiementEcole({
    idParametresPaiementEcole: 'PARAM-001',
    idEcole: 'ECOLE-001',
    paiementPartielAutorise: false,
    paiementPartielParTypeFrais: new Map([[TypeFrais.FRAIS_SCOLAIRES, true]]),
    politiqueArrieres: PolitiqueArrieres.AUTORISER_AVEC_SUIVI,
    autoriserInscriptionAvecDette: true,
    bloquerRetraitDocumentsSiDette: false,
    appliquerFamilleNombreuse: false,
    modesPaiementAutorises: [ModePaiement.CASH],
    exigerFraisInscription: false,
    actif: true,
    version: 1,
  });
}

function creerObligation(id: string, montantHistorique: number, montantPaye: number): ObligationFinanciereEleve {
  const obligation = ObligationFinanciereEleve.creer({
    idObligation: id,
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-001',
    idAnneeScolaire: 'ANNEE-001',
    typeFrais: TypeFrais.FRAIS_SCOLAIRES,
    referenceFrais: new ReferenceFrais(id.replace(/-/g, '_')),
    libelle: `Obligation ${id}`,
    montantDuHistorique: new Money(montantHistorique, 'CDF'),
    origineCreation: OrigineObligation.GENERATION_INITIALE,
    creePar: 'UTIL-001',
  });

  if (montantPaye > 0) {
    obligation.enregistrerPaiement(new Money(montantPaye, 'CDF'), OrigineAffectation.NORMAL);
  }

  return obligation;
}

function creerLigneDette(
  idObligation: string,
  statut: StatutDette,
  montantDuHistorique: number,
  montantPaye: number,
  montantExonere: number,
  solde: number,
): LigneDette {
  return new LigneDette({
    idObligation,
    typeFrais: TypeFrais.FRAIS_SCOLAIRES,
    referenceFrais: new ReferenceFrais(idObligation.replace(/-/g, '_')),
    libelle: `Ligne ${idObligation}`,
    montantDuHistorique: new Money(montantDuHistorique, 'CDF'),
    montantPaye: new Money(montantPaye, 'CDF'),
    montantExonere: new Money(montantExonere, 'CDF'),
    solde: new Money(solde, 'CDF'),
    statut,
  });
}

function creerDetteEleve(): DetteEleve {
  const detteArriere = new DetteAnnuelle({
    idAnneeScolaire: 'ANNEE-2024',
    statutAnnee: 'CLOTUREE',
    lignes: [creerLigneDette('OBL-ARR-001', StatutDette.PARTIEL, 5_000, 2_000, 0, 3_000)],
    totalDu: new Money(5_000, 'CDF'),
    totalPaye: new Money(2_000, 'CDF'),
    totalExonere: new Money(0, 'CDF'),
    soldeRestant: new Money(3_000, 'CDF'),
  });
  const detteCourante = new DetteAnnuelle({
    idAnneeScolaire: 'ANNEE-2025',
    statutAnnee: 'ACTIVE',
    lignes: [creerLigneDette('OBL-ACT-001', StatutDette.PARTIEL, 10_000, 4_000, 0, 6_000)],
    totalDu: new Money(10_000, 'CDF'),
    totalPaye: new Money(4_000, 'CDF'),
    totalExonere: new Money(0, 'CDF'),
    soldeRestant: new Money(6_000, 'CDF'),
  });

  return new DetteEleve({
    idDetteEleve: 'DETTE-001',
    idEleve: 'ELEVE-001',
    idEcole: 'ECOLE-001',
    dettesParAnnee: [detteArriere, detteCourante],
    totalArrieres: new Money(3_000, 'CDF'),
    totalAnneeActive: new Money(6_000, 'CDF'),
    totalGlobal: new Money(9_000, 'CDF'),
  });
}

test('ConsulterDetteEleve retourne le total global et les details par annee', async () => {
  const autorisation = new AutorisationSituationFinanciereMemoire();
  const casUsage = new ConsulterDetteEleveUseCase(
    new DepotDetteMemoire(creerDetteEleve()),
    new ScolaritePortMemoire(),
    autorisation,
  );

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'UTIL-001',
    idEleve: 'ELEVE-001',
  });

  assert.equal(sortie.totalGlobal.obtenirMontant(), 9_000);
  assert.equal(sortie.dettesParAnnee.length, 2);
  assert.equal(sortie.dettesParAnnee[0]?.lignes.length, 1);
  assert.deepEqual(autorisation.appels[0], {
    idUtilisateur: 'UTIL-001',
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-001',
  });
});

test('ConsulterDetteEleve separe bien annee courante et arrieres', async () => {
  const depotDette = new DepotDetteMemoire(creerDetteEleve());
  const casUsage = new ConsulterDetteEleveUseCase(
    depotDette,
    new ScolaritePortMemoire(),
  );

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'UTIL-001',
    idEleve: 'ELEVE-001',
  });

  assert.equal(sortie.totalArrieres.obtenirMontant(), 3_000);
  assert.equal(sortie.totalAnneeActive.obtenirMontant(), 6_000);
  assert.equal(sortie.dettesParAnnee.find((dette) => dette.statutAnnee === 'ACTIVE')?.soldeRestant.obtenirMontant(), 6_000);
  assert.equal(depotDette.dernierIdEcole, 'ECOLE-001');
});

test('ConsulterFraisExigiblesEleve retourne uniquement les frais non soldes', async () => {
  const autorisation = new AutorisationSituationFinanciereMemoire();
  const obligations = [
    creerObligation('OBL-001', 10_000, 4_000),
    creerObligation('OBL-002', 5_000, 5_000),
  ];
  const casUsage = new ConsulterFraisExigiblesEleveUseCase(
    new ScolaritePortMemoire(),
    new DepotObligationsMemoire(obligations),
    new DepotParametresMemoire(creerParametres()),
    autorisation,
  );

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'UTIL-001',
    idEleve: 'ELEVE-001',
  });

  assert.equal(sortie.fraisDisponibles.length, 1);
  assert.equal(sortie.fraisDisponibles[0]?.resteAPayer.obtenirMontant(), 6_000);
  assert.equal(autorisation.appels.length, 1);
});

test('ConsulterFraisExigiblesEleve exclut les frais soldes et conserve la regle de paiement partiel', async () => {
  const obligations = [
    creerObligation('OBL-001', 10_000, 10_000),
    creerObligation('OBL-002', 5_000, 1_000),
  ];
  const casUsage = new ConsulterFraisExigiblesEleveUseCase(
    new ScolaritePortMemoire(),
    new DepotObligationsMemoire(obligations),
    new DepotParametresMemoire(creerParametres()),
  );

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'UTIL-001',
    idEleve: 'ELEVE-001',
  });

  assert.equal(sortie.fraisDisponibles.length, 1);
  assert.equal(sortie.fraisDisponibles[0]?.paiementPartielAutorise, true);
});
