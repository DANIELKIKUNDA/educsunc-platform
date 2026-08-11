import type { AuditOutboxMessage } from '../../application/outbox';
import type { AuditOutboxPublisherPort } from '../../application/ports/outbound';
import type { PostgresAuditEventBus } from '../event-bus';
import { AuditCanonicalEventMapper } from './AuditCanonicalEventMapper';

export class AuditOutboxEventPublisher implements AuditOutboxPublisherPort {
  public constructor(private readonly eventBus: PostgresAuditEventBus) {}

  public async publier(message: AuditOutboxMessage): Promise<void> {
    const auditEntry = AuditCanonicalEventMapper.versAuditEntry(message.event);
    await this.eventBus.orchestrator.publier(message.event.eventType, {
      auditEntry,
      eventId: message.event.eventId,
      requestId: message.event.requestId,
      correlationId: message.event.correlationId,
      organisationId: message.event.tenant.organisationId,
      ecoleId: message.event.tenant.ecoleId,
      scope: message.event.tenant.scope,
      dateAction: message.event.occurredAt,
    });
  }
}
