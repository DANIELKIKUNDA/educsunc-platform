import test from 'node:test';
import assert from 'node:assert/strict';
import { AnnulerPaiementUseCase, type DepotRecuPaiementParPaiement } from '../../../application/use-cases/annulations/AnnulerPaiementUseCase';
import { RestituerExcedentUseCase } from '../../../application/use-cases/annulations/RestituerExcedentUseCase';
import { CaisseJour } from '../../../domain/aggregates/CaisseJour';
import { ObligationFinanciereEleve } from '../../../domain/aggregates/ObligationFinanciereEleve';
import { Paiement } from '../../../domain/aggregates/Paiement';
import { RecuPaiement } from '../../../domain/aggregates/RecuPaiement';
import { Restitution } from '../../../domain/aggregates/Restitution';
import { RepartitionPaiement } from '../../../domain/entities/RepartitionPaiement';
import type { DepotAnnulationPaiement } from '../../../domain/repositories/DepotAnnulationPaiement';
import type { DepotCaisseJour } from '../../../domain/repositories/DepotCaisseJour';
import type { DepotPaiement } from '../../../domain/repositories/DepotPaiement';
import type { DepotRestitution } from '../../../domain/repositories/DepotRestitution';
import { CiblePaiement } from '../../../domain/value-objects/CiblePaiement';
import { ModePaiement } from '../../../domain/value-objects/ModePaiement';
import { Money } from '../../../domain/value-objects/Money';
import { OrigineAffectation } from '../../../domain/value-objects/OrigineAffectation';
import { OrigineObligation } from '../../../domain/value-objects/OrigineObligation';
import { ReferenceFrais } from '../../../domain/value-objects/ReferenceFrais';
import { StatutCaisse } from '../../../domain/value-objects/StatutCaisse';
import { TypeFrais } from '../../../domain/value-objects/TypeFrais';
import { MoteurRecu } from '../../../domain/services/MoteurRecu';

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
}

class DepotRecuMemoire implements DepotRecuPaiementParPaiement {
  constructor(private readonly recus: RecuPaiement[]) {}

  public async sauvegarder(_recu: RecuPaiement): Promise<void> {}

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

test('RestituerExcedent cree une restitution avec le montant correct et la sauvegarde', async () => {
  const { paiement } = creerPaiementValide();
  const depotPaiement = new DepotPaiementMemoire(paiement);
  const depotRestitution = new DepotRestitutionMemoire();
  const casUsage = new RestituerExcedentUseCase(depotPaiement, depotRestitution);

  const sortie = await casUsage.executer({
    idPaiement: paiement.obtenirId(),
    idEcole: paiement.obtenirIdEcole(),
    idEleve: paiement.obtenirIdEleve(),
    effectuePar: 'UTIL-002',
  });

  assert.equal(sortie.montant.obtenirMontant(), 10_000);
  assert.equal(sortie.raison, 'EXCEDENT');
  assert.equal(depotRestitution.sauvegardes.length, 1);
});

test('AnnulerPaiement met a jour l etat du paiement, conserve les recus et cloture la caisse', async () => {
  const { paiement, recus } = creerPaiementValide();
  const caisse = creerCaisse();
  const depotPaiement = new DepotPaiementMemoire(paiement);
  const depotRecu = new DepotRecuMemoire(recus);
  const depotCaisse = new DepotCaisseMemoire(caisse);
  const depotAnnulation = new DepotAnnulationMemoire();
  const casUsage = new AnnulerPaiementUseCase(
    depotPaiement,
    depotRecu,
    depotCaisse,
    depotAnnulation,
  );

  const idAnnulation = await casUsage.executer({
    idPaiement: paiement.obtenirId(),
    raison: 'Erreur de saisie',
    annulePar: 'UTIL-003',
  });

  assert.equal(idAnnulation, `${paiement.obtenirId()}-ANNULATION`);
  assert.equal(paiement.obtenirStatutPaiement(), 'ANNULE');
  assert.equal(caisse.obtenirStatut(), StatutCaisse.CLOTUREE);
  assert.equal(depotPaiement.sauvegardes.length, 1);
  assert.equal(depotCaisse.sauvegardes.length, 1);
  assert.equal(depotAnnulation.sauvegardes.length, 1);
});
