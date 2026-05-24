import { PersistentOfflineAuditQueue } from '../queue/PersistentOfflineAuditQueue';
import type { OfflineAuditQueueItem } from '../OfflineAuditTypes';

// Le retry offline conserve son historique et respecte une limite explicite.
export class OfflineAuditRetryService {
  public constructor(
    private readonly queue: PersistentOfflineAuditQueue = new PersistentOfflineAuditQueue(),
  ) {}

  public reprogrammer(itemId: string, raison: string): OfflineAuditQueueItem | null {
    const item = this.queue.retrouver(itemId);
    if (!item) {
      return null;
    }

    const nextRetryCount = item.retryCount + 1;
    const updated: OfflineAuditQueueItem = {
      ...item,
      retryCount: nextRetryCount,
      retryHistory: [...item.retryHistory, `${new Date().toISOString()}:${raison}`],
      statut: nextRetryCount > item.retryLimit ? 'ECHEC' : 'EN_ATTENTE',
    };
    this.queue.mettreAJour(updated);
    return updated;
  }
}
