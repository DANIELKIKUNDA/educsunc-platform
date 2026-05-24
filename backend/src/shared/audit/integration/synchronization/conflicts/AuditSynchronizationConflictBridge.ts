import { SynchronizationConflictResolver } from '../../../infrastructure/synchronization';
import type { OfflineAuditQueueItem } from '../../../infrastructure/offline';

export class AuditSynchronizationConflictBridge {
  public constructor(
    private readonly resolver: SynchronizationConflictResolver = new SynchronizationConflictResolver(),
  ) {}

  public async detecter(item: OfflineAuditQueueItem, description?: string) {
    return this.resolver.detecter({
      idQueueItem: item.id,
      description,
      organisationId: item.organisationId,
      ecoleId: item.ecoleId,
      scope: item.scope,
    });
  }
}
