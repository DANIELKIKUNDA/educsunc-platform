import type { AuditEntry } from '../../../domain/aggregates';
import { ProjectionWorker } from '../workers/ProjectionWorker';

export class AuditProjectionJobRunner {
  private readonly worker = new ProjectionWorker();

  public async executer(auditEntry: AuditEntry): Promise<void> {
    await this.worker.executer({ auditEntry });
  }
}
