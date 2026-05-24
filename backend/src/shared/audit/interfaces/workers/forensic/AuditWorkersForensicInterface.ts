import type { AuditWorkerForensicDto } from '../dto';
export class AuditWorkersForensicInterface {
  public static creer(): AuditWorkerForensicDto {
    return { replayMetadata: true, retryMetadata: true, queueMetadata: true, workerMetadata: true, timing: true, chronology: true };
  }
}

