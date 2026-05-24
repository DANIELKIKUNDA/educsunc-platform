import type { OfflineAuditQueueItem } from '../../../infrastructure/offline';

export class AuditSynchronizationRetryBridge {
  public enrichir(item: OfflineAuditQueueItem, raison: string): OfflineAuditQueueItem {
    return {
      ...item,
      retryCount: item.retryCount + 1,
      retryHistory: [...item.retryHistory, `${new Date().toISOString()}:SYNC_RETRY:${raison}`],
    };
  }
}
