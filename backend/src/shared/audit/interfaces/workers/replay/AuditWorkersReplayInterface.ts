import type { AuditWorkerReplayDto } from '../dto';
export class AuditWorkersReplayInterface {
  public static creer(): AuditWorkerReplayDto {
    return { chronology: true, replayMetadata: true, correlation: true, tenantIsolation: true };
  }
}

