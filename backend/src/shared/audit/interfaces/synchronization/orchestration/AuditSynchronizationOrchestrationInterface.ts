import type { AuditSynchronizationOrchestrationDto } from '../dto';

export class AuditSynchronizationOrchestrationInterface {
  public static creer(sortie?: Partial<AuditSynchronizationOrchestrationDto>): AuditSynchronizationOrchestrationDto {
    return {
      queues: sortie?.queues ?? 0,
      workers: sortie?.workers ?? 0,
      projections: sortie?.projections ?? 0,
      monitoring: sortie?.monitoring ?? 0,
      forensic: sortie?.forensic ?? 0,
    };
  }
}

