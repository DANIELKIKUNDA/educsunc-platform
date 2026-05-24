import type { AuditWorkerSynchronizationDto } from '../dto';
export class AuditWorkersSynchronizationInterface {
  public static creer(): AuditWorkerSynchronizationDto {
    return { chronologyReelle: true, retryMetadata: true, replayMetadata: true, deviceMetadata: true };
  }
}

