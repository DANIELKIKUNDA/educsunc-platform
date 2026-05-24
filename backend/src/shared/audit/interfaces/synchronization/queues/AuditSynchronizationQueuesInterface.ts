import type { AuditSynchronizationQueueDto } from '../dto';

export class AuditSynchronizationQueuesInterface {
  public static creer(sortie?: Partial<AuditSynchronizationQueueDto>): AuditSynchronizationQueueDto {
    return {
      backlog: sortie?.backlog ?? 0,
      saturation: sortie?.saturation ?? false,
      retries: sortie?.retries ?? 0,
      deadLetter: sortie?.deadLetter ?? 0,
      throughput: sortie?.throughput ?? 0,
    };
  }
}

