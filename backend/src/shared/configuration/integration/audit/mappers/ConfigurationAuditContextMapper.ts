import type { SharedBusEventMetadata } from 'shared/infrastructure/bus';
import type { ConfigurationContext } from '../../../context';

export class ConfigurationAuditContextMapper {
  public static versMetadata(context: ConfigurationContext): Partial<SharedBusEventMetadata> {
    return {
      requestId: context.requestId,
      correlationId: context.correlationId,
      traceId: context.traceId,
      spanId: context.spanId,
      organisationId: context.organisationId,
      ecoleId: context.ecoleId,
      sessionId: context.sessionId,
      utilisateurId: context.actorId,
      deviceId: context.deviceId,
      replayId: context.replayId,
      retryCount: context.retryCount ?? 0,
      syncId: context.syncId,
      occurredAt: context.changedAt,
      actionTimestamp: context.changedAt,
    };
  }
}
