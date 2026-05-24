import { AuditExportOrchestrator } from '../../exports';
import { WorkerDependencyFactory } from '../_WorkerDependencyFactory';
import type { AuditExportRequest } from '../../exports';

export class ExportWorker {
  private readonly orchestrator = new AuditExportOrchestrator(WorkerDependencyFactory.creerProjectionHandler());

  public async executer(payload: { request: AuditExportRequest; filtres?: Record<string, unknown> }): Promise<void> {
    await this.orchestrator.generer(payload.request, payload.filtres);
  }
}
