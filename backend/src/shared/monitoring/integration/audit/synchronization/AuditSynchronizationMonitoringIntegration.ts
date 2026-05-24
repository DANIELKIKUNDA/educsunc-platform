import { AuditSynchronizationRuntimeMonitoring } from 'shared/audit/infrastructure/monitoring';

export class AuditSynchronizationMonitoringIntegration {
  public constructor(
    private readonly synchronization: AuditSynchronizationRuntimeMonitoring = new AuditSynchronizationRuntimeMonitoring(),
  ) {}

  public obtenirSnapshot() {
    return this.synchronization.obtenirSnapshot();
  }
}
