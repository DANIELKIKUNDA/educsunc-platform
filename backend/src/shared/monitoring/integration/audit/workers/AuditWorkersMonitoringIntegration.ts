import { AuditWorkerMonitoringService } from 'shared/audit/infrastructure/workers';

export class AuditWorkersMonitoringIntegration {
  public constructor(
    private readonly workers: AuditWorkerMonitoringService = new AuditWorkerMonitoringService(),
  ) {}

  public obtenirSnapshot() {
    return this.workers.obtenirSnapshot();
  }
}
