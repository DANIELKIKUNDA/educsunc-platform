import test from 'node:test';
import assert from 'node:assert/strict';
import type { AuditFinancierInput } from '../../../application/ports/AuditPort';
import { CloturerCaisseJourUseCase } from '../../../application/use-cases/caisse/CloturerCaisseJourUseCase';
import { OuvrirCaisseJourUseCase } from '../../../application/use-cases/caisse/OuvrirCaisseJourUseCase';
import { CaisseJour } from '../../../domain/aggregates/CaisseJour';
import { OperationCaisse } from '../../../domain/entities/OperationCaisse';
import type { DepotCaisseJour } from '../../../domain/repositories/DepotCaisseJour';
import { ModePaiement } from '../../../domain/value-objects/ModePaiement';
import { Money } from '../../../domain/value-objects/Money';
import { StatutCaisse } from '../../../domain/value-objects/StatutCaisse';
import { TypeOperationCaisse } from '../../../domain/value-objects/TypeOperationCaisse';

// Ce fichier teste les use cases d'ouverture et de cloture de caisse.

class DepotCaisseMemoire implements DepotCaisseJour {
  public readonly sauvegardes: CaisseJour[] = [];

  constructor(
    private readonly caisseParId: CaisseJour | null = null,
    private readonly caisseActive: CaisseJour | null = null,
  ) {}

  public async sauvegarder(caisseJour: CaisseJour): Promise<void> {
    this.sauvegardes.push(caisseJour);
  }

  public async trouverParId(idCaisseJour: string): Promise<CaisseJour | null> {
    return this.caisseParId?.obtenirId() === idCaisseJour ? this.caisseParId : null;
  }

  public async trouverActiveParEcoleEtDate(
    _idEcole: string,
    _dateCaisse: string,
  ): Promise<CaisseJour | null> {
    return this.caisseActive;
  }
}

class AuditMemoire {
  public readonly entrees: AuditFinancierInput[] = [];

  public async journaliserActionFinanciere(input: AuditFinancierInput): Promise<void> {
    this.entrees.push(input);
  }
}

function creerCaisseOuverte(id = 'CAISSE-001'): CaisseJour {
  return CaisseJour.ouvrir({
    idCaisseJour: id,
    idEcole: 'ECOLE-001',
    dateCaisse: '2026-09-01',
    ouvertePar: 'UTIL-001',
  });
}

test('OuvrirCaisseJour ouvre une caisse quand aucune caisse active n existe', async () => {
  const depot = new DepotCaisseMemoire(null, null);
  const audit = new AuditMemoire();
  const casUsage = new OuvrirCaisseJourUseCase(depot, audit);

  const sortie = await casUsage.executer({
    idEcole: 'ECOLE-001',
    date: '2026-09-01',
    idUtilisateur: 'UTIL-001',
  });

  assert.equal(sortie.statut, StatutCaisse.OUVERTE);
  assert.equal(depot.sauvegardes.length, 1);
  assert.equal(audit.entrees.length, 1);
});

test('OuvrirCaisseJour refuse une ouverture si une caisse active existe deja', async () => {
  const caisse = creerCaisseOuverte();
  const depot = new DepotCaisseMemoire(null, caisse);
  const casUsage = new OuvrirCaisseJourUseCase(depot);

  await assert.rejects(() => casUsage.executer({
    idEcole: 'ECOLE-001',
    date: '2026-09-01',
    idUtilisateur: 'UTIL-001',
  }));
});

test('CloturerCaisseJour cloture la caisse et conserve les totaux calcules', async () => {
  const caisse = creerCaisseOuverte();
  caisse.ajouterOperation(new OperationCaisse({
    idOperation: 'OP-001',
    idPaiement: 'PAY-001',
    typeOperation: TypeOperationCaisse.PAIEMENT,
    montant: new Money(8_000, 'CDF'),
    modePaiement: ModePaiement.CASH,
    idCaissier: 'UTIL-001',
    dateOperation: new Date(),
  }));
  const depot = new DepotCaisseMemoire(caisse, caisse);
  const audit = new AuditMemoire();
  const casUsage = new CloturerCaisseJourUseCase(depot, audit);

  const sortie = await casUsage.executer({
    idCaisseJour: caisse.obtenirId(),
    clotureePar: 'UTIL-002',
    montantPhysiqueDeclare: new Money(8_000, 'CDF'),
    observation: 'RAS',
  });

  assert.equal(sortie.statut, StatutCaisse.CLOTUREE);
  assert.equal(sortie.totalEncaisse.obtenirMontant(), 8_000);
  assert.equal(depot.sauvegardes.length, 1);
  assert.equal(audit.entrees.length, 1);
});

test('CloturerCaisseJour garde une tracabilite par utilisateur dans l audit', async () => {
  const caisse = creerCaisseOuverte();
  const depot = new DepotCaisseMemoire(caisse, caisse);
  const audit = new AuditMemoire();
  const casUsage = new CloturerCaisseJourUseCase(depot, audit);

  await casUsage.executer({
    idCaisseJour: caisse.obtenirId(),
    clotureePar: 'UTIL-999',
    observation: 'Fermeture de fin de journee',
  });

  assert.equal(audit.entrees[0]?.idUtilisateur, 'UTIL-999');
});
