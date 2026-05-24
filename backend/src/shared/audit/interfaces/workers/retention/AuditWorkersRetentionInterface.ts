import type { AuditWorkerRetentionDto } from '../dto';
export class AuditWorkersRetentionInterface {
  public static creer(): AuditWorkerRetentionDto {
    return { archival: true, coldStorage: true, purge: true, cleanup: true, retentionRebuild: true };
  }
}

