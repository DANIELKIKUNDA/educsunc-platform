import { AuditWorkerMonitoringService } from '../../../infrastructure/workers';

// Ce pont expose backlog, lag et dead-letters du monde asynchrone Audit.
export class AuditWorkersQueueMonitoringBridge {
  public constructor(
    private readonly monitoring = new AuditWorkerMonitoringService(),
  ) {}

  public obtenirSnapshot() {
    return this.monitoring.obtenirSnapshot();
  }
}
