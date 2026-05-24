import type { AuditMonitoringMetricsDto } from '../dto';

export class AuditMonitoringMetricsInterface {
  public static creer(sortie?: Partial<AuditMonitoringMetricsDto>): AuditMonitoringMetricsDto {
    return {
      replayCount: sortie?.replayCount ?? 0,
      retryCount: sortie?.retryCount ?? 0,
      exportDurationMs: sortie?.exportDurationMs ?? 0,
      queueSize: sortie?.queueSize ?? 0,
      syncFailures: sortie?.syncFailures ?? 0,
      workerThroughput: sortie?.workerThroughput ?? 0,
      projectionLag: sortie?.projectionLag ?? 0,
    };
  }
}

