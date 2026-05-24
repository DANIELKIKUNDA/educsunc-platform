import type { AuditMonitoringProjectionsDto } from '../dto';

export class AuditMonitoringProjectionsInterface {
  public static creer(
    sortie?: Partial<AuditMonitoringProjectionsDto>,
  ): AuditMonitoringProjectionsDto {
    return {
      lag: sortie?.lag ?? 0,
      rebuilds: sortie?.rebuilds ?? 0,
      failures: sortie?.failures ?? 0,
      desynchronisations: sortie?.desynchronisations ?? 0,
      volumetrie: sortie?.volumetrie ?? 0,
    };
  }
}
