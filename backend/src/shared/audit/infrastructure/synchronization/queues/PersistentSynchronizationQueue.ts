import { PersistentOfflineAuditQueue } from '../../offline';
import type { OfflineAuditQueueItem } from '../../offline';

// La synchronisation repose sur une queue persistante ordonnee, pas sur un upload monolithique.
export class PersistentSynchronizationQueue {
  public constructor(
    private readonly offlineQueue: PersistentOfflineAuditQueue = new PersistentOfflineAuditQueue(),
  ) {}

  public listerEnAttente(): OfflineAuditQueueItem[] {
    return this.offlineQueue.listerEnAttente();
  }

  public retrouver(id: string): OfflineAuditQueueItem | null {
    return this.offlineQueue.retrouver(id);
  }

  public mettreAJour(item: OfflineAuditQueueItem): void {
    this.offlineQueue.mettreAJour(item);
  }
}
