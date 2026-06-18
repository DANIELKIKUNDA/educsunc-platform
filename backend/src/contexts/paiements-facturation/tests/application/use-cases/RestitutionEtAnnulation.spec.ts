import test from 'node:test';
import assert from 'node:assert/strict';
import { AnnulerPaiementUseCase, type DepotRecuPaiementParPaiement } from '../../../application/use-cases/annulations/AnnulerPaiementUseCase';
import { RestituerExcedentUseCase } from '../../../application/use-cases/annulations/RestituerExcedentUseCase';
import { CaisseJour } from '../../../domain/aggregates/CaisseJour';
import { ObligationFinanciereEleve } from '../../../domain/aggregates/ObligationFinanciereEleve';
import { Paiement } from '../../../domain/aggregates/Paiement';
import { RecuPaiement } from '../../../domain/aggregates/RecuPaiement';
import { Restitution } from '../../../domain/aggregates/Restitution';
import { OperationCaisse } from '../../../domain/entities/OperationCaisse';
import { RepartitionPaiement } from '../../../domain/entities/RepartitionPaiement';
import type { DepotAnnulationPaiement } from '../../../domain/repositories/DepotAnnulationPaiement';
import type { DepotCaisseJour } from '../../../domain/repositories/DepotCaisseJour';
import type { DepotPaiement } from '../../../domain/repositories/DepotPaiement';
import type { DepotRestitution } from '../../../domain/repositories/DepotRestitution';
import type { AutorisationAnnulationPaiementPort } from '../../../application/ports/AutorisationAnnulationPaiementPort';
import type { AutorisationReimpressionRecuPort } from '../../../application/ports/AutorisationReimpressionRecuPort';
import type { ProjectionRecuPaiementPort } from '../../../application/ports/ProjectionRecuPaiementPort';
import type { AutorisationRestitutionPaiementPort } from '../../../application/ports/AutorisationRestitutionPaiementPort';
import type {
  ClasseEleveDTO,
  ElevePaiementDTO,
  FamillePaiementDTO,
  InscriptionPaiementDTO,
  ScolariteElevesPort,
  StatutScolaireDTO,
} from '../../../application/ports/ScolariteElevesPort';
import { CiblePaiement } from '../../../domain/value-objects/CiblePaiement';
import { ErreurDroitsInsuffisants } from '../../../application/exceptions/ErreurDroitsInsuffisants';
import { ModePaiement } from '../../../domain/value-objects/ModePaiement';
import { Money } from '../../../domain/value-objects/Money';
import { OrigineAffectation } from '../../../domain/value-objects/OrigineAffectation';
import { OrigineObligation } from '../../../domain/value-objects/OrigineObligation';
import { ReferenceFrais } from '../../../domain/value-objects/ReferenceFrais';
import { StatutCaisse } from '../../../domain/value-objects/StatutCaisse';
import { TypeFrais } from '../../../domain/value-objects/TypeFrais';
import { TypeOperationCaisse } from '../../../domain/value-objects/TypeOperationCaisse';
import { MoteurRecu } from '../../../domain/services/MoteurRecu';
import { ReimprimerRecuUseCase } from '../../../application/use-cases/recus/ReimprimerRecuUseCase';
import { TelechargerRecuPdfUseCase } from '../../../application/use-cases/recus/TelechargerRecuPdfUseCase';
import { AssemblageRecuPaiementOfficielService } from '../../../application/services/AssemblageRecuPaiementOfficielService';
import { ServicePdfRecuPaiement } from '../../../infrastructure/services/ServicePdfRecuPaiement';

// Ce fichier teste les use cases de restitution et d'annulation de paiement.

class DepotPaiementMemoire implements DepotPaiement {
  public readonly sauvegardes: Paiement[] = [];

  constructor(private readonly paiement: Paiement | null) {}

  public async sauvegarder(paiement: Paiement): Promise<void> {
    this.sauvegardes.push(paiement);
  }

  public async trouverParId(idPaiement: string): Promise<Paiement | null> {
    return this.paiement?.obtenirId() === idPaiement ? this.paiement : null;
  }

  public async trouverParIdempotencyKey(): Promise<Paiement | null> {
    return null;
  }
}

class DepotRestitutionMemoire implements DepotRestitution {
  public readonly sauvegardes: Restitution[] = [];

  public async sauvegarder(restitution: Restitution): Promise<void> {
    this.sauvegardes.push(restitution);
  }

  public async trouverParId(): Promise<null> {
    return null;
  }

  public async trouverParPaiement(idPaiement: string): Promise<Restitution | null> {
    return this.sauvegardes.find((restitution) => restitution.obtenirIdPaiement() === idPaiement) ?? null;
  }
}

class DepotRecuMemoire implements DepotRecuPaiementParPaiement {
  public readonly sauvegardes: RecuPaiement[] = [];

  constructor(private readonly recus: RecuPaiement[]) {}

  public async sauvegarder(recu: RecuPaiement): Promise<void> {
    this.sauvegardes.push(recu);
  }

  public async trouverParId(idRecu: string): Promise<RecuPaiement | null> {
    return this.recus.find((recu) => recu.obtenirId() === idRecu) ?? null;
  }

  public async listerParPaiement(idPaiement: string): Promise<RecuPaiement[]> {
    return this.recus.filter((recu) => recu.obtenirIdPaiement() === idPaiement);
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

  public async trouverActiveParEcoleEtDate(): Promise<CaisseJour | null> {
    return this.caisse;
  }
}

class DepotAnnulationMemoire implements DepotAnnulationPaiement {
  public readonly sauvegardes: import('../../../domain/aggregates/AnnulationPaiement').AnnulationPaiement[] = [];

  public async sauvegarder(
    annulationPaiement: import('../../../domain/aggregates/AnnulationPaiement').AnnulationPaiement,
  ): Promise<void> {
    this.sauvegardes.push(annulationPaiement);
  }

  public async trouverParId(): Promise<null> { return null; }
  public async trouverParPaiement(): Promise<null> { return null; }
}

class ScolaritePortMemoire implements ScolariteElevesPort {
  public async consulterEleve(idEleve: string): Promise<ElevePaiementDTO> {
    return { idEleve, idEcole: 'ECOLE-001', idOrganisation: 'ORG-001' };
  }

  public async consulterInscriptionActive(_idEleve: string): Promise<InscriptionPaiementDTO | null> {
    return null;
  }

  public async consulterClasseActiveEleve(): Promise<ClasseEleveDTO | null> {
    return null;
  }

  public async consulterFamilleEleve(): Promise<FamillePaiementDTO | null> {
    return null;
  }

  public async verifierStatutScolaire(idEleve: string): Promise<StatutScolaireDTO> {
    return { idEleve, statut: 'ACTIF', actif: true };
  }
}

class AutorisationAnnulationMemoire implements AutorisationAnnulationPaiementPort {
  public appels: Array<{
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
    typeFrais: string;
  }> = [];

  public async verifierAnnulationPaiement(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
    typeFrais: TypeFrais;
  }): Promise<void> {
    this.appels.push(params);
  }
}

class AutorisationRestitutionMemoire implements AutorisationRestitutionPaiementPort {
  public appels: Array<{
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
    typeFrais: string;
  }> = [];

  public async verifierRestitutionPaiement(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
    typeFrais: TypeFrais;
  }): Promise<void> {
    this.appels.push(params);
  }
}

class AutorisationReimpressionMemoire implements AutorisationReimpressionRecuPort {
  public appels: Array<{
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }> = [];

  public async verifierReimpressionRecu(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void> {
    this.appels.push(params);
  }
}

class ProjectionRecuPaiementMemoire implements ProjectionRecuPaiementPort {
  public async consulterEleve(idEleve: string) {
    return {
      idEleve,
      code: '3618',
      nom: 'Mukuta',
      postnom: 'Musenge',
      prenom: 'Josias',
      sexe: 'F',
    };
  }

  public async consulterEcole(idEcole: string) {
    return {
      idEcole,
      nom: 'Paroisse Saint Raphael',
      sigle: 'CAT',
      adresse: 'Q. Hewa Bora, Lubumbashi',
      telephone: '+243 999 000 000',
      email: 'contact@cat.cd',
    };
  }

  public async consulterContexteScolaire() {
    return {
      anneeScolaire: '2025 - 2026',
      classe: '4eme H - ELEC',
    };
  }

  public async consulterCaissier(idUtilisateur: string) {
    return {
      idUtilisateur,
      nomComplet: 'Daniel K.',
    };
  }
}

function creerObligation(): ObligationFinanciereEleve {
  return ObligationFinanciereEleve.creer({
    idObligation: 'OBL-001',
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-001',
    idAnneeScolaire: 'ANNEE-001',
    typeFrais: TypeFrais.FRAIS_SCOLAIRES,
    referenceFrais: new ReferenceFrais('OBL_001'),
    libelle: 'Frais scolaires',
    montantDuHistorique: new Money(10_000, 'CDF'),
    origineCreation: OrigineObligation.GENERATION_INITIALE,
    creePar: 'UTIL-001',
  });
}

function creerPaiementValide(): { paiement: Paiement; obligation: ObligationFinanciereEleve; recus: RecuPaiement[] } {
  const obligation = creerObligation();
  const paiement = Paiement.creer({
    idPaiement: 'PAY-001',
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-001',
    montantTotal: new Money(10_000, 'CDF'),
    modePaiement: ModePaiement.CASH,
    typeFraisDeclare: TypeFrais.FRAIS_SCOLAIRES,
    ciblePaiement: CiblePaiement.STANDARD,
    idempotencyKey: 'KEY-001',
    creePar: 'UTIL-001',
  });
  obligation.enregistrerPaiement(new Money(10_000, 'CDF'), OrigineAffectation.NORMAL);
  paiement.repartir([
    new RepartitionPaiement({
      idRepartition: 'REP-001',
      idPaiement: paiement.obtenirId(),
      idObligation: obligation.obtenirId(),
      montantAffecte: new Money(10_000, 'CDF'),
      ordreAffectation: 1,
      origineAffectation: OrigineAffectation.NORMAL,
    }),
  ]);
  paiement.valider();
  const recus = new MoteurRecu().generer(
    paiement,
    new Map([[obligation.obtenirId(), obligation]]),
    'UTIL-001',
  );

  return { paiement, obligation, recus };
}

function creerCaisse(): CaisseJour {
  return CaisseJour.ouvrir({
    idCaisseJour: 'CAISSE-001',
    idEcole: 'ECOLE-001',
    dateCaisse: new Date().toISOString().slice(0, 10),
    ouvertePar: 'UTIL-001',
  });
}

function ajouterOperationPaiementInitiale(caisse: CaisseJour, paiement: Paiement): void {
  caisse.ajouterOperation(new OperationCaisse({
    idOperation: 'OP-001',
    idPaiement: paiement.obtenirId(),
    typeOperation: TypeOperationCaisse.PAIEMENT,
    montant: paiement.obtenirMontantTotal(),
    modePaiement: paiement.obtenirModePaiement(),
    idCaissier: paiement.obtenirCreePar(),
    dateOperation: new Date(),
  }));
}

test('RestituerExcedent cree une restitution avec le montant correct et la sauvegarde', async () => {
  const { paiement } = creerPaiementValide();
  const caisse = creerCaisse();
  ajouterOperationPaiementInitiale(caisse, paiement);
  const depotPaiement = new DepotPaiementMemoire(paiement);
  const depotRestitution = new DepotRestitutionMemoire();
  const depotCaisse = new DepotCaisseMemoire(caisse);
  const autorisation = new AutorisationRestitutionMemoire();
  const casUsage = new RestituerExcedentUseCase(
    depotPaiement,
    depotRestitution,
    depotCaisse,
    new ScolaritePortMemoire(),
    autorisation,
  );

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idPaiement: paiement.obtenirId(),
    idEcole: paiement.obtenirIdEcole(),
    idUtilisateur: 'UTIL-002',
    idEleve: paiement.obtenirIdEleve(),
    effectuePar: 'UTIL-002',
  });

  assert.equal(sortie.montant.obtenirMontant(), 10_000);
  assert.equal(sortie.raison, 'EXCEDENT');
  assert.equal(paiement.obtenirStatutPaiement(), 'REMBOURSE');
  assert.equal(depotRestitution.sauvegardes.length, 1);
  assert.equal(caisse.obtenirOperations().length, 2);
  assert.equal(caisse.obtenirOperations()[1]?.obtenirTypeOperation(), 'RESTITUTION');
  assert.equal(caisse.obtenirTotalEncaisse().obtenirMontant(), 0);
  assert.equal(caisse.obtenirTotalParCaissier().get('UTIL-001')?.obtenirMontant(), 0);
  assert.equal(depotCaisse.sauvegardes.length, 1);
  assert.deepEqual(autorisation.appels[0], {
    idUtilisateur: 'UTIL-002',
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-001',
    typeFrais: 'FRAIS_SCOLAIRES',
  });
});

test('AnnulerPaiement met a jour l etat du paiement, persiste les recus annules et ajoute une operation inverse en caisse', async () => {
  const { paiement, recus } = creerPaiementValide();
  const caisse = creerCaisse();
  ajouterOperationPaiementInitiale(caisse, paiement);
  const depotPaiement = new DepotPaiementMemoire(paiement);
  const depotRecu = new DepotRecuMemoire(recus);
  const depotCaisse = new DepotCaisseMemoire(caisse);
  const depotAnnulation = new DepotAnnulationMemoire();
  const autorisation = new AutorisationAnnulationMemoire();
  const casUsage = new AnnulerPaiementUseCase(
    depotPaiement,
    depotRecu,
    depotCaisse,
    depotAnnulation,
    new ScolaritePortMemoire(),
    autorisation,
  );

  const idAnnulation = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'UTIL-003',
    idPaiement: paiement.obtenirId(),
    raison: 'Erreur de saisie',
    annulePar: 'UTIL-003',
  });

  assert.equal(idAnnulation, `${paiement.obtenirId()}-ANNULATION`);
  assert.equal(paiement.obtenirStatutPaiement(), 'ANNULE');
  assert.equal(caisse.obtenirStatut(), StatutCaisse.OUVERTE);
  assert.equal(caisse.obtenirOperations().length, 2);
  assert.equal(caisse.obtenirOperations()[1]?.obtenirTypeOperation(), 'ANNULATION');
  assert.equal(caisse.obtenirOperations()[1]?.obtenirIdAnnulation(), idAnnulation);
  assert.equal(caisse.obtenirTotalEncaisse().obtenirMontant(), 0);
  assert.equal(caisse.obtenirTotalParCaissier().get('UTIL-001')?.obtenirMontant(), 0);
  assert.equal(depotPaiement.sauvegardes.length, 1);
  assert.equal(depotRecu.sauvegardes.length, recus.length);
  assert.equal(depotRecu.sauvegardes[0]?.obtenirStatutRecu(), 'ANNULE');
  assert.equal(depotCaisse.sauvegardes.length, 1);
  assert.equal(depotAnnulation.sauvegardes.length, 1);
  assert.deepEqual(autorisation.appels[0], {
    idUtilisateur: 'UTIL-003',
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-001',
    typeFrais: 'FRAIS_SCOLAIRES',
  });
});

test('ReimprimerRecu relit le recu dans la bonne ecole et reapplique la securite locale', async () => {
  const { recus } = creerPaiementValide();
  const depotRecu = new DepotRecuMemoire(recus);
  const autorisation = new AutorisationReimpressionMemoire();
  const casUsage = new ReimprimerRecuUseCase(
    new AssemblageRecuPaiementOfficielService(
      depotRecu as never,
      new ProjectionRecuPaiementMemoire(),
    ),
    autorisation,
  );

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'UTIL-004',
    idRecu: recus[0]!.obtenirId(),
  });

  assert.equal(sortie.idPaiement, recus[0]!.obtenirIdPaiement());
  assert.equal(sortie.lignes.length, 1);
  assert.equal(sortie.totalPaye.obtenirMontant(), 10_000);
  assert.equal(sortie.caissier.nomComplet, 'Daniel K.');
  assert.deepEqual(autorisation.appels[0], {
    idUtilisateur: 'UTIL-004',
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
  });

  await assert.rejects(() => casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-002',
    idUtilisateur: 'UTIL-004',
    idRecu: recus[0]!.obtenirId(),
  }), ErreurDroitsInsuffisants);
});

test('TelechargerRecuPdf genere un PDF officiel a partir du recu agrege', async () => {
  const { recus } = creerPaiementValide();
  const depotRecu = new DepotRecuMemoire(recus);
  const autorisation = new AutorisationReimpressionMemoire();
  const casUsage = new TelechargerRecuPdfUseCase(
    new AssemblageRecuPaiementOfficielService(
      depotRecu as never,
      new ProjectionRecuPaiementMemoire(),
    ),
    new ServicePdfRecuPaiement(),
    autorisation,
  );

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'UTIL-004',
    idRecu: recus[0]!.obtenirId(),
  });

  assert.equal(sortie.mimeType, 'application/pdf');
  assert.match(sortie.nomFichier, /^recu-/);
  assert.match(sortie.contenu.toString('utf8', 0, 8), /%PDF-1\.4/);
});
