import type { OfflineAuditQueueItem } from '../../offline';
import type { AuditSynchronizationBatch } from '../SynchronizationTypes';

// Le batching garde des lots petits, ordonnes et reprenables.
export class SynchronizationBatchBuilder {
  public construire(items: OfflineAuditQueueItem[], tailleMax = 100): AuditSynchronizationBatch[] {
    const batches: AuditSynchronizationBatch[] = [];
    for (let index = 0; index < items.length; index += tailleMax) {
      const lot = items.slice(index, index + tailleMax);
      batches.push({
        idBatch: `sync-batch-${index}-${Date.now()}`,
        items: lot,
        taille: lot.length,
        creeLe: new Date().toISOString(),
      });
    }
    return batches;
  }
}
