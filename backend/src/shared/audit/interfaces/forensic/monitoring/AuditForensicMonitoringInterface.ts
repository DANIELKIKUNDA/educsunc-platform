import type { AuditForensicMonitoringDto } from '../dto';

export class AuditForensicMonitoringInterface {
  public static creer(sortie?: Partial<AuditForensicMonitoringDto>): AuditForensicMonitoringDto {
    return {
      anomalies: sortie?.anomalies ?? 0,
      incidents: sortie?.incidents ?? 0,
      retries: sortie?.retries ?? 0,
      replays: sortie?.replays ?? 0,
      syncFailures: sortie?.syncFailures ?? 0,
    };
  }
}

