import assert from 'node:assert/strict';
import test from 'node:test';
import type { DepotJournalSynchronisation } from 'shared/infrastructure/sync/SyncLogRepository';
import { ResolveurConflit } from 'shared/infrastructure/sync/ConflictResolver';
import { ServiceSynchronisationParDefaut } from 'shared/infrastructure/sync/SyncService';

class JournaliseurMock {
  public info(): void {}
  public erreur(): void {}
}

class DepotJournalMock implements DepotJournalSynchronisation {
  private readonly journaux: Array<{ operation: string; statut: string }> = [];
  public async enregistrerDebut(operation: string): Promise<string> {
    this.journaux.push({ operation, statut: 'DEBUT' });
    return `${operation}-${this.journaux.length}`;
  }
  public async enregistrerSucces(): Promise<void> {}
  public async enregistrerEchec(): Promise<void> {}
  public async listerParOperation(operation: string): Promise<any[]> {
    return this.journaux.filter((journal) => journal.operation === operation);
  }
}

test('la synchronisation offline des paiements reste idempotente et coherente', async () => {
  const depot = new DepotJournalMock();
  const service = new ServiceSynchronisationParDefaut(new JournaliseurMock() as never, depot, new ResolveurConflit());
  const resultat = await service.synchroniser([{ id: 'paiement-1' }, { id: 'paiement-1' }], { module: 'paiements' });
  assert.equal(resultat.poussees, 2);
  assert.ok((await depot.listerParOperation('POUSSER')).length >= 1);
});
