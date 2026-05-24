import type { AuditContext } from '../../../context';
import type { SharedBusEventMetadata } from '../../../../infrastructure/bus';

// Ce mapper convertit le contexte Audit distribue en metadata evenementielle partagee.
export class AuditEventContextMapper {
  public static versMetadata(auditContext?: AuditContext): Partial<SharedBusEventMetadata> {
    if (!auditContext) {
      return {};
    }

    return {
      requestId: auditContext.requestId,
      correlationId: auditContext.correlationId,
      parentCorrelationId: auditContext.correlation.parentCorrelationId,
      workflowId: auditContext.correlation.workflowId,
      causationId: auditContext.correlation.causationId,
      traceId: auditContext.trace.traceId,
      spanId: auditContext.trace.spanId,
      parentSpanId: auditContext.trace.parentSpanId,
      organisationId: auditContext.tenant.organisationId,
      ecoleId: auditContext.tenant.ecoleId,
      scope: auditContext.tenant.ecoleId ? 'ECOLE' : auditContext.tenant.organisationId ? 'ORGANISATION' : 'PLATEFORME',
      sessionId: auditContext.utilisateur.sessionId,
      utilisateurId: auditContext.utilisateur.utilisateurId,
      deviceId: auditContext.device.deviceId,
      appVersion: auditContext.device.appVersion,
      plateforme: auditContext.device.platform,
      syncId: auditContext.synchronization.syncId,
      replayId: auditContext.replay.replayId,
      replayReason: auditContext.replay.replayReason,
      replaySource: auditContext.replay.replaySource,
      replayTimestamp: auditContext.replay.replayTimestamp,
      retryCount: auditContext.retry.retryCount,
      retryReason: auditContext.retry.retryReason,
      retryBackoffMs: auditContext.retry.retryBackoff,
      retryHistory: auditContext.retry.retryHistory,
      occurredAt: auditContext.timestamps.recuAt,
      actionTimestamp: auditContext.forensic.chronology.dateActionOriginale,
      syncTimestamp: auditContext.synchronization.chronologyMetadata.syncTimestamp as string | undefined,
      retryTimestamp: auditContext.forensic.retryMetadata.retryTimestamp as string | undefined,
    };
  }
}

