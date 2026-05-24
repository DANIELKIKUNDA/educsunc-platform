import type { AuditSynchronizationWorkerDto } from '../dto';

export class AuditSynchronizationWorkersInterface {
  public static creer(sortie?: Partial<AuditSynchronizationWorkerDto>): AuditSynchronizationWorkerDto {
    return {
      syncWorkers: sortie?.syncWorkers ?? 0,
      replayWorkers: sortie?.replayWorkers ?? 0,
      retryWorkers: sortie?.retryWorkers ?? 0,
      mergeWorkers: sortie?.mergeWorkers ?? 0,
      projectionWorkers: sortie?.projectionWorkers ?? 0,
    };
  }
}

