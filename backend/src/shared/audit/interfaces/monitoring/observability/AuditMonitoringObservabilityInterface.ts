import type { AuditMonitoringObservabilityDto } from '../dto';

export class AuditMonitoringObservabilityInterface {
  public static creer(sortie?: Partial<AuditMonitoringObservabilityDto>): AuditMonitoringObservabilityDto {
    return {
      metriques: sortie?.metriques ?? 0,
      traces: sortie?.traces ?? 0,
      evenements: sortie?.evenements ?? 0,
      timings: sortie?.timings ?? 0,
      correlations: sortie?.correlations ?? 0,
    };
  }
}

