import { AuditExportMonitoringService } from '../../exports';

export class AuditExportRuntimeMonitoring {
  public constructor(
    private readonly monitoring: AuditExportMonitoringService = new AuditExportMonitoringService(),
  ) {}

  public obtenirSnapshot() {
    return this.monitoring.obtenirSnapshot();
  }
}
