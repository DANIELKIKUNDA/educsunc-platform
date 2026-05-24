import { SynchronizationMonitoringService } from '../../synchronization';

export class AuditSynchronizationRuntimeMonitoring {
  public constructor(
    private readonly monitoring: SynchronizationMonitoringService = new SynchronizationMonitoringService(),
  ) {}

  public obtenirSnapshot() {
    return this.monitoring.obtenirSnapshot();
  }
}
