import type { AuditContext } from '../../../context';
import type { OfflineAuditQueueItem } from '../../../infrastructure/offline';
import type { AuditSynchronizationMetadata } from '../AuditSynchronizationIntegrationTypes';

export class AuditSynchronizationMetadataBuilder {
  public static depuisContext(auditContext?: AuditContext): AuditSynchronizationMetadata {
    return {
      correlationId: auditContext?.correlationId,
      requestId: auditContext?.requestId,
      organisationId: auditContext?.tenant.organisationId,
      ecoleId: auditContext?.tenant.ecoleId,
      scope: auditContext?.tenant.scopes[0],
      deviceId: auditContext?.device.deviceId,
      syncId: auditContext?.synchronization.syncId,
      replayId: auditContext?.replay.replayId,
      retryCount: auditContext?.retry.retryCount ?? 0,
      chronology: {},
    };
  }

  public static depuisItem(item: OfflineAuditQueueItem): AuditSynchronizationMetadata {
    return {
      correlationId: item.envelope.metadata.correlationId,
      requestId: item.envelope.metadata.requestId,
      organisationId: item.organisationId,
      ecoleId: item.ecoleId,
      scope: item.scope,
      deviceId: item.deviceId,
      syncId: item.envelope.metadata.syncId,
      replayId: item.replayId,
      retryCount: item.retryCount,
      chronology: {
        dateActionReelle: item.dateActionReelle,
        dateInsertionLocale: item.dateInsertionLocale,
      },
    };
  }
}
