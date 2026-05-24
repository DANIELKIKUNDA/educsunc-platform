import type { AuditWorkerQueueDto } from '../dto';
export class AuditWorkersQueuesInterface {
  public static creer(nom: string, correlationId?: string, organisationId?: string, ecoleId?: string): AuditWorkerQueueDto {
    return { nom, chronology: true, correlationId, organisationId, ecoleId, retryMetadata: true, replayMetadata: true };
  }
}

