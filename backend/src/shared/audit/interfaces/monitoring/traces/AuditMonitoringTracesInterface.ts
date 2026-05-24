import type { AuditMonitoringTraceDto } from '../dto';

export class AuditMonitoringTracesInterface {
  public static creer(sortie?: Partial<AuditMonitoringTraceDto>): AuditMonitoringTraceDto {
    return {
      requestId: sortie?.requestId,
      correlationId: sortie?.correlationId,
      sessionId: sortie?.sessionId,
      replayId: sortie?.replayId,
      etapes: sortie?.etapes ?? [],
    };
  }
}

