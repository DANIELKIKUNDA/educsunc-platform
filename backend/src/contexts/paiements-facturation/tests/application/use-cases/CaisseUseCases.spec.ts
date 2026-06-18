import test from 'node:test';
import assert from 'node:assert/strict';
import type { AuditFinancierInput } from '../../../application/ports/AuditPort';
import type { AutorisationCaissePort } from '../../../application/ports/AutorisationCaissePort';
import { CloturerCaisseJourUseCase } from '../../../application/use-cases/caisse/CloturerCaisseJourUseCase';
import { ConsulterCaisseJourUseCase } from '../../../application/use-cases/caisse/ConsulterCaisseJourUseCase';
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

class AutorisationCaisseMemoire implements AutorisationCaissePort {
  public readonly appelsConsultation: Array<{
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }> = [];
  public readonly appelsCloture: Array<{
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }> = [];
  public readonly appels: Array<{
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }> = [];

  public async verifierOuvertureCaisse(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void> {
    this.appels.push(params);
  }

  public async verifierConsultationCaisse(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void> {
    this.appelsConsultation.push(params);
  }

  public async verifierClotureCaisse(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void> {
    this.appelsCloture.push(params);
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
  const autorisation = new AutorisationCaisseMemoire();
  const casUsage = new OuvrirCaisseJourUseCase(depot, autorisation, audit);

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    date: '2026-09-01',
    idUtilisateur: 'UTIL-001',
  });

  assert.equal(sortie.statut, StatutCaisse.OUVERTE);
  assert.equal(depot.sauvegardes.length, 1);
  assert.equal(audit.entrees.length, 1);
  assert.deepEqual(autorisation.appels[0], {
    idUtilisateur: 'UTIL-001',
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
  });
});

test('OuvrirCaisseJour refuse une ouverture si une caisse active existe deja', async () => {
  const caisse = creerCaisseOuverte();
  const depot = new DepotCaisseMemoire(null, caisse);
  const casUsage = new OuvrirCaisseJourUseCase(depot, new AutorisationCaisseMemoire());

  await assert.rejects(() => casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    date: '2026-09-01',
    idUtilisateur: 'UTIL-001',
  }));
});

test('ConsulterCaisseJour reapplique l autorisation locale avant de retourner la caisse active', async () => {
  const caisse = creerCaisseOuverte();
  const depot = new DepotCaisseMemoire(null, caisse);
  const autorisation = new AutorisationCaisseMemoire();
  const casUsage = new ConsulterCaisseJourUseCase(depot, autorisation);

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    date: '2026-09-01',
    idUtilisateur: 'UTIL-LECTURE',
  });

  assert.equal(sortie.idCaisseJour, caisse.obtenirId());
  assert.deepEqual(autorisation.appelsConsultation[0], {
    idUtilisateur: 'UTIL-LECTURE',
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
  });
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
  const autorisation = new AutorisationCaisseMemoire();
  const casUsage = new CloturerCaisseJourUseCase(depot, autorisation, audit);

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idCaisseJour: caisse.obtenirId(),
    clotureePar: 'UTIL-002',
    montantPhysiqueDeclare: new Money(8_000, 'CDF'),
    observation: 'RAS',
  });

  assert.equal(sortie.statut, StatutCaisse.CLOTUREE);
  assert.equal(sortie.totalEncaisse.obtenirMontant(), 8_000);
  assert.equal(depot.sauvegardes.length, 1);
  assert.equal(audit.entrees.length, 1);
  assert.deepEqual(autorisation.appelsCloture[0], {
    idUtilisateur: 'UTIL-002',
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
  });
});

test('CloturerCaisseJour garde une tracabilite par utilisateur dans l audit', async () => {
  const caisse = creerCaisseOuverte();
  const depot = new DepotCaisseMemoire(caisse, caisse);
  const audit = new AuditMemoire();
  const casUsage = new CloturerCaisseJourUseCase(depot, new AutorisationCaisseMemoire(), audit);

  await casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idCaisseJour: caisse.obtenirId(),
    clotureePar: 'UTIL-999',
    observation: 'Fermeture de fin de journee',
  });

  assert.equal(audit.entrees[0]?.idUtilisateur, 'UTIL-999');
});

test("CloturerCaisseJour refuse une cloture hors ecole courante", async () => {
  const caisse = CaisseJour.ouvrir({
    idCaisseJour: 'CAISSE-002',
    idEcole: 'ECOLE-999',
    dateCaisse: '2026-09-01',
    ouvertePar: 'UTIL-001',
  });
  const depot = new DepotCaisseMemoire(caisse, caisse);
  const casUsage = new CloturerCaisseJourUseCase(depot, new AutorisationCaisseMemoire());

  await assert.rejects(() => casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idCaisseJour: caisse.obtenirId(),
    clotureePar: 'UTIL-999',
  }));
});
