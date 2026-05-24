import { AuditProjectionMonitoringService } from 'shared/audit/infrastructure/monitoring';

export class AuditProjectionsMonitoringIntegration {
  public constructor(
    private readonly projections: AuditProjectionMonitoringService = new AuditProjectionMonitoringService(),
  ) {}

  public obtenirSnapshot() {
    return this.projections.obtenirSnapshot();
  }
}
