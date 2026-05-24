import { AuditExportRuntimeMonitoring } from 'shared/audit/infrastructure/monitoring';

export class AuditExportsMonitoringIntegration {
  public constructor(
    private readonly exports: AuditExportRuntimeMonitoring = new AuditExportRuntimeMonitoring(),
  ) {}

  public obtenirSnapshot() {
    return this.exports.obtenirSnapshot();
  }
}
