import type { OfflineAuditQueueItem } from '../../offline';
import type { AuditSynchronizationMergeStrategy } from '../SynchronizationTypes';

// Le merge append-only reste la strategie par defaut pour l audit.
export class SynchronizationMergeService {
  public fusionner(
    item: OfflineAuditQueueItem,
    strategy: AuditSynchronizationMergeStrategy,
  ): OfflineAuditQueueItem {
    switch (strategy) {
      case 'APPEND_ONLY':
      case 'MERGE_AUTOMATIQUE':
      case 'MERGE_METIER':
      case 'MERGE_MANUEL':
        return item;
      case 'CONFLIT':
      default:
        return { ...item, statut: 'CONFLIT' };
    }
  }
}
