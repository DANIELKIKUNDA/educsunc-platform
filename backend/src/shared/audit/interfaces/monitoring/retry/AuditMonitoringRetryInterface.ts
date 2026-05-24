import type { AuditMonitoringRetryDto } from '../dto';

export class AuditMonitoringRetryInterface {
  public static creer(sortie?: Partial<AuditMonitoringRetryDto>): AuditMonitoringRetryDto {
    return {
      loops: sortie?.loops ?? 0,
      storms: sortie?.storms ?? 0,
      failures: sortie?.failures ?? 0,
      saturation: sortie?.saturation ?? false,
    };
  }
}

