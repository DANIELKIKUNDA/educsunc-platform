import type { AuditExportMonitoringDto } from '../dto';

// Cette interface publie un snapshot de supervision des exports Audit.
export class AuditExportMonitoringInterface {
  public static creer(sortie?: Partial<AuditExportMonitoringDto>): AuditExportMonitoringDto {
    return {
      actifs: sortie?.actifs ?? 0,
      echoues: sortie?.echoues ?? 0,
      downloads: sortie?.downloads ?? 0,
      expirations: sortie?.expirations ?? 0,
      volumetrie: sortie?.volumetrie ?? 0,
    };
  }
}

