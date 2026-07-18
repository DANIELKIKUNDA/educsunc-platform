import type { SharedBusEventEnvelope } from '../../../../infrastructure/bus';
import { AuditEventMonitoringBridge } from '../monitoring/AuditEventMonitoringBridge';
import type { PostgresAuditEventBus } from '../../../infrastructure/event-bus';

// Ce dispatcher relie le bus partage aux projections, au monitoring et au bus Audit interne.
export class AuditIntegrationEventDispatcher {
  public constructor(
    private readonly auditBus: PostgresAuditEventBus,
    private readonly monitoring = new AuditEventMonitoringBridge(),
  ) {}

  public async dispatch(envelope: SharedBusEventEnvelope): Promise<void> {
    await this.monitoring.observer(envelope);
    await this.auditBus.orchestrator.publier(envelope.name, {
      ...envelope.payload,
      ...envelope.metadata,
      eventId: envelope.metadata.eventId,
      dateAction: envelope.metadata.actionTimestamp ?? envelope.metadata.occurredAt,
    });
  }
}
