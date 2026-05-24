import { obtenirSharedEventBus } from '../../../../infrastructure/bus';

// Cette vue expose les indicateurs minimaux du bus partage pour Audit.
export class AuditEventBusObservability {
  public obtenirSnapshot() {
    const events = obtenirSharedEventBus().lister();
    return {
      totalEvents: events.length,
      totalWithCorrelation: events.filter((event) => Boolean(event.metadata.correlationId)).length,
      totalWithTenant: events.filter((event) => Boolean(event.metadata.organisationId || event.metadata.ecoleId)).length,
      totalReplays: events.filter((event) => Boolean(event.metadata.replayId)).length,
      totalRetries: events.reduce((total, event) => total + event.metadata.retryCount, 0),
      totalWithTrace: events.filter((event) => Boolean(event.metadata.traceId)).length,
      totalWithWorkerContext: events.filter((event) => Boolean(event.payload['workerId'] || event.payload['queueName'])).length,
    };
  }
}
