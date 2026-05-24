import type { AuditMonitoringReplayDto } from '../dto';

export class AuditMonitoringReplayInterface {
  public static creer(sortie?: Partial<AuditMonitoringReplayDto>): AuditMonitoringReplayDto {
    return {
      actifs: sortie?.actifs ?? 0,
      failures: sortie?.failures ?? 0,
      volumetrie: sortie?.volumetrie ?? 0,
      durationMs: sortie?.durationMs ?? 0,
      queues: sortie?.queues ?? 0,
    };
  }
}

