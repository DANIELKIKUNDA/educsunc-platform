import { OfflineAuditMonitoringService } from '../../../infrastructure/offline';
import { SynchronizationMonitoringService } from '../../../infrastructure/synchronization';

export class AuditSynchronizationMonitoringBridge {
  public constructor(
    private readonly offlineMonitoring: OfflineAuditMonitoringService = new OfflineAuditMonitoringService(),
    private readonly synchronizationMonitoring: SynchronizationMonitoringService = new SynchronizationMonitoringService(),
  ) {}

  public obtenirSnapshot() {
    return {
      offline: this.offlineMonitoring.obtenirSnapshot(),
      synchronization: this.synchronizationMonitoring.obtenirSnapshot(),
    };
  }
}
