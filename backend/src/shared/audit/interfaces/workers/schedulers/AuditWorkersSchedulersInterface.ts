import type { AuditSchedulerDto } from '../dto';
export class AuditWorkersSchedulersInterface {
  public static creer(): AuditSchedulerDto {
    return { retention: true, purge: true, archival: true, analyticsRebuild: true, projectionsRebuild: true, monitoringCleanup: true };
  }
}

