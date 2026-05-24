import {
  AuditTenantMonitoringService,
  AuditVolumetryMonitoringService,
} from 'shared/audit/infrastructure/monitoring';

export class AuditAnalyticsMonitoringIntegration {
  public constructor(
    private readonly tenants: AuditTenantMonitoringService = new AuditTenantMonitoringService(),
    private readonly volumetry: AuditVolumetryMonitoringService = new AuditVolumetryMonitoringService(),
  ) {}

  public obtenirSnapshot() {
    return {
      tenants: this.tenants.obtenirSnapshot(),
      volumetrie: this.volumetry.obtenirSnapshot(),
    };
  }
}
