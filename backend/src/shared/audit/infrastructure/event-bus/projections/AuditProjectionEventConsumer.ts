import type { AuditEntry } from '../../../domain/aggregates';
import { PostgresAuditProjectionHandler } from '../../persistence/postgres/projections';
import type { AuditEventEnvelope } from '../EventBusTypes';
import type { AuditEventHandler } from '../handlers/AuditEventHandler';

// Ce consumer alimente les projections async depuis AuditEntryCreated.
export class AuditProjectionEventConsumer implements AuditEventHandler {
  public readonly eventNames = ['AuditEntryCreated'] as const;

  constructor(private readonly projectionHandler: PostgresAuditProjectionHandler) {}

  public async handle(envelope: AuditEventEnvelope): Promise<void> {
    const auditEntry = envelope.payload.auditEntry;
    if (auditEntry && typeof auditEntry === 'object') {
      await this.projectionHandler.traiterAuditEntryCreated(auditEntry as AuditEntry);
    }
  }
}

