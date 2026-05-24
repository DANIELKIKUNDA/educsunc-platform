import { OfflineAuditForensicService } from '../../../infrastructure/offline';
import type { OfflineAuditQueueItem } from '../../../infrastructure/offline';

export class AuditSynchronizationForensicBridge {
  public constructor(
    private readonly forensic: OfflineAuditForensicService = new OfflineAuditForensicService(),
  ) {}

  public construireSnapshot(item?: OfflineAuditQueueItem) {
    return this.forensic.construireSnapshot({
      syncId: item?.envelope.metadata.syncId,
      replayId: item?.replayId,
      deviceId: item?.deviceId,
      organisationId: item?.organisationId,
      ecoleId: item?.ecoleId,
      scope: item?.scope,
    });
  }
}
