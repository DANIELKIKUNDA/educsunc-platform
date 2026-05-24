import type { AuditMonitoringTenantDto } from '../dto';

export class AuditMonitoringTenantsInterface {
  public static creer(sortie?: Partial<AuditMonitoringTenantDto>): AuditMonitoringTenantDto {
    return {
      volumetrieTenant: sortie?.volumetrieTenant ?? 0,
      exportsTenant: sortie?.exportsTenant ?? 0,
      incidentsTenant: sortie?.incidentsTenant ?? 0,
      replayTenant: sortie?.replayTenant ?? 0,
      syncTenant: sortie?.syncTenant ?? 0,
    };
  }
}

