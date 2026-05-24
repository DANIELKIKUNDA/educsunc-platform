import type { AuditSynchronizationBatchingDto } from '../dto';

export class AuditSynchronizationBatchingInterface {
  public static creer(sortie?: Partial<AuditSynchronizationBatchingDto>): AuditSynchronizationBatchingDto {
    return {
      batchSync: sortie?.batchSync ?? true,
      incrementalSync: sortie?.incrementalSync ?? true,
      chunkSync: sortie?.chunkSync ?? true,
      streamingSync: sortie?.streamingSync ?? false,
    };
  }
}

