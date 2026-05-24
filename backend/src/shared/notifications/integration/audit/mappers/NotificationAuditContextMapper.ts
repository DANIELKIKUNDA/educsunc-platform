import type { SharedBusEventMetadata } from 'shared/infrastructure/bus';
import type { NotificationContext } from '../../../context';

export class NotificationAuditContextMapper {
  public static versMetadata(context: NotificationContext): Partial<SharedBusEventMetadata> {
    return {
      requestId: context.requestId,
      correlationId: context.correlationId,
      traceId: context.traceId,
      spanId: context.spanId,
      organisationId: context.organisationId,
      ecoleId: context.ecoleId,
      sessionId: context.sessionId,
      utilisateurId: context.utilisateurId ?? context.acteurId,
      deviceId: context.deviceId,
      syncId: context.syncId,
      replayId: context.replayId,
      replayReason: context.replayReason,
      replaySource: context.replaySource,
      retryCount: context.retryCount ?? 0,
      retryReason: context.retryReason,
      retryBackoffMs: context.retryBackoffMs,
      retryHistory: context.retryHistory ?? [],
      occurredAt: context.requestedAt,
      actionTimestamp: context.requestedAt,
    };
  }
}
