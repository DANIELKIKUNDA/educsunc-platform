import { AuditQueueMonitoringService } from 'shared/audit/infrastructure/monitoring';

export class AuditQueuesMonitoringIntegration {
  public constructor(
    private readonly queues: AuditQueueMonitoringService = new AuditQueueMonitoringService(),
  ) {}

  public obtenirSnapshot() {
    return this.queues.obtenirSnapshot();
  }
}
