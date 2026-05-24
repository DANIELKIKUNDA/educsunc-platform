import type { AuditEntry } from '../../../../domain/aggregates';
import { PostgresAuditProjectionProjector } from './PostgresAuditProjectionProjector';

// Ce handler formalise le workflow event-driven AuditEntryCreated -> projections async.
export class PostgresAuditProjectionHandler {
  constructor(private readonly projector: PostgresAuditProjectionProjector) {}

  public async traiterAuditEntryCreated(entree: AuditEntry): Promise<void> {
    await this.projector.projeter(entree);
  }
}

