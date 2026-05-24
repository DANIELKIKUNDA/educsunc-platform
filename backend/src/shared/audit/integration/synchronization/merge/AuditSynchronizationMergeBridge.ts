import {
  SynchronizationMergeService,
  type AuditSynchronizationMergeStrategy,
} from '../../../infrastructure/synchronization';
import type { OfflineAuditQueueItem } from '../../../infrastructure/offline';

export class AuditSynchronizationMergeBridge {
  public constructor(
    private readonly merge: SynchronizationMergeService = new SynchronizationMergeService(),
  ) {}

  public fusionner(
    item: OfflineAuditQueueItem,
    strategy: AuditSynchronizationMergeStrategy,
  ): OfflineAuditQueueItem {
    return this.merge.fusionner(item, strategy);
  }
}
