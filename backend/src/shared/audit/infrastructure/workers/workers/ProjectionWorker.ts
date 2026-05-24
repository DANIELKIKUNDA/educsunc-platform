import type { AuditEntry } from '../../../domain/aggregates';
import { WorkerDependencyFactory } from '../_WorkerDependencyFactory';

export class ProjectionWorker {
  private readonly handler = WorkerDependencyFactory.creerProjectionHandler();

  public async executer(payload: { auditEntry: AuditEntry }): Promise<void> {
    await this.handler.traiterAuditEntryCreated(payload.auditEntry);
  }
}
