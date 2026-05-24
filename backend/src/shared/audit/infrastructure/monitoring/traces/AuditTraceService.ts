import { obtenirSharedEventBus } from '../../../../infrastructure/bus';
import type { AuditTraceRecord } from '../MonitoringTypes';

// Les traces regroupent les workflows distribués via correlation_id, request_id, session_id et replay_id.
export class AuditTraceService {
  public lister(): AuditTraceRecord[] {
    const groups = new Map<string, AuditTraceRecord>();
    for (const event of obtenirSharedEventBus().lister()) {
      const key = [
        event.metadata.correlationId ?? 'NA',
        event.metadata.requestId ?? 'NA',
        event.metadata.sessionId ?? 'NA',
        event.metadata.replayId ?? 'NA',
      ].join('|');

      const current = groups.get(key) ?? {
        traceId: event.metadata.traceId,
        spanId: event.metadata.spanId,
        correlationId: event.metadata.correlationId,
        requestId: event.metadata.requestId,
        sessionId: event.metadata.sessionId,
        replayId: event.metadata.replayId,
        organisationId: event.metadata.organisationId,
        ecoleId: event.metadata.ecoleId,
        workerId: typeof event.payload['workerId'] === 'string' ? event.payload['workerId'] : undefined,
        queueName: typeof event.payload['queueName'] === 'string' ? event.payload['queueName'] : undefined,
        retryCount: event.metadata.retryCount,
        eventIds: [],
        eventNames: [],
      };
      current.eventIds.push(event.metadata.eventId);
      current.eventNames.push(event.name);
      groups.set(key, current);
    }
    return [...groups.values()];
  }
}
