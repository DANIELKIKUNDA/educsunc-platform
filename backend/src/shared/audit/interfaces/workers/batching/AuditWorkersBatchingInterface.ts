import type { AuditWorkerQueueDto } from '../dto';
export class AuditWorkersBatchingInterface {
  public static creer(): AuditWorkerQueueDto {
    return { nom: 'batching', chronology: true, retryMetadata: true, replayMetadata: true };
  }
}

