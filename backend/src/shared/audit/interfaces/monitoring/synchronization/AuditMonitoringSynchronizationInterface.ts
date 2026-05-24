import type { AuditMonitoringSynchronizationDto } from '../dto';

export class AuditMonitoringSynchronizationInterface {
  public static creer(
    sortie?: Partial<AuditMonitoringSynchronizationDto>,
  ): AuditMonitoringSynchronizationDto {
    return {
      failures: sortie?.failures ?? 0,
      conflits: sortie?.conflits ?? 0,
      replaySync: sortie?.replaySync ?? 0,
      retrySync: sortie?.retrySync ?? 0,
      appareilsOffline: sortie?.appareilsOffline ?? 0,
      delaisSyncMs: sortie?.delaisSyncMs ?? 0,
    };
  }
}

