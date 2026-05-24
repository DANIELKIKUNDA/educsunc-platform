import { ExportWorker } from '../workers/ExportWorker';
import type { AuditExportRequest } from '../../exports';

export class AuditExportJobRunner {
  private readonly worker = new ExportWorker();

  public async executer(request: AuditExportRequest, filtres?: Record<string, unknown>): Promise<void> {
    await this.worker.executer({ request, filtres });
  }
}
