import { OfflineAuditRetryService } from '../../offline';
import type { OfflineAuditQueueItem } from '../../offline';

// Le retry sync reste borne et traçable.
export class SynchronizationRetryService {
  public constructor(
    private readonly retryService: OfflineAuditRetryService = new OfflineAuditRetryService(),
  ) {}

  public reprogrammer(itemId: string, raison: string): OfflineAuditQueueItem | null {
    return this.retryService.reprogrammer(itemId, raison);
  }
}
