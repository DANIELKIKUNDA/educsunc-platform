import { PersistentOfflineAuditQueue } from '../queue/PersistentOfflineAuditQueue';
import type { OfflineAuditQueueItem } from '../OfflineAuditTypes';

// Le replay offline rejoue sans transformer l action en nouvel evenement metier.
export class OfflineAuditReplayService {
  public constructor(
    private readonly queue: PersistentOfflineAuditQueue = new PersistentOfflineAuditQueue(),
  ) {}

  public preparerReplay(itemId: string, replaySource: string, replayReason: string): OfflineAuditQueueItem | null {
    const item = this.queue.retrouver(itemId);
    if (!item) {
      return null;
    }

    const replayed: OfflineAuditQueueItem = {
      ...item,
      replaySource,
      replayReason,
      replayTimestamp: new Date().toISOString(),
      statut: 'EN_ATTENTE',
    };
    this.queue.mettreAJour(replayed);
    return replayed;
  }
}
