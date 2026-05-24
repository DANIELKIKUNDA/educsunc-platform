import type { AuditSynchronizationMonitoringDto } from '../dto';

export class AuditSynchronizationMonitoringInterface {
  public static creer(sortie?: Partial<AuditSynchronizationMonitoringDto>): AuditSynchronizationMonitoringDto {
    return {
      syncFailures: sortie?.syncFailures ?? 0,
      retryStorms: sortie?.retryStorms ?? 0,
      replaySync: sortie?.replaySync ?? 0,
      saturation: sortie?.saturation ?? 0,
      appareilsOffline: sortie?.appareilsOffline ?? 0,
      conflits: sortie?.conflits ?? 0,
    };
  }
}

