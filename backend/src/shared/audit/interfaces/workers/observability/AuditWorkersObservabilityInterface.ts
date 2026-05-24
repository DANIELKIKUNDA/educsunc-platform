import type { AuditWorkerObservabilityDto } from '../dto';
export class AuditWorkersObservabilityInterface {
  public static creer(requestId?: string, correlationId?: string): AuditWorkerObservabilityDto {
    return { requestId, correlationId, traces: true, metriques: true, timings: true, workerMetadata: true };
  }
}

