import type { AuditMonitoringExportsDto } from '../dto';

export class AuditMonitoringExportsInterface {
  public static creer(sortie?: Partial<AuditMonitoringExportsDto>): AuditMonitoringExportsDto {
    return {
      actifs: sortie?.actifs ?? 0,
      volumetrie: sortie?.volumetrie ?? 0,
      tempsGenerationMs: sortie?.tempsGenerationMs ?? 0,
      expirations: sortie?.expirations ?? 0,
      downloads: sortie?.downloads ?? 0,
      failures: sortie?.failures ?? 0,
    };
  }
}

