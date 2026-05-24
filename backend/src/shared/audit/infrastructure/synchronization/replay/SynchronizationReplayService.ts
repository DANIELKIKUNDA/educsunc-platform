import { OfflineAuditReplayService } from '../../offline';
import type { OfflineAuditQueueItem } from '../../offline';

// Le replay sync sert a reprendre ou reconstruire, sans creer une nouvelle action metier.
export class SynchronizationReplayService {
  public constructor(
    private readonly replayService: OfflineAuditReplayService = new OfflineAuditReplayService(),
  ) {}

  public rejouer(itemId: string, raison: string): OfflineAuditQueueItem | null {
    return this.replayService.preparerReplay(itemId, 'SYNC_ENGINE', raison);
  }
}
