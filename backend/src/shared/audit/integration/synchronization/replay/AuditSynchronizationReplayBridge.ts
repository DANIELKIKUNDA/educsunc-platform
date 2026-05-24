import type { OfflineAuditQueueItem } from '../../../infrastructure/offline';

export class AuditSynchronizationReplayBridge {
  public enrichir(item: OfflineAuditQueueItem): OfflineAuditQueueItem {
    return {
      ...item,
      replayTimestamp: item.replayTimestamp ?? new Date().toISOString(),
    };
  }
}
