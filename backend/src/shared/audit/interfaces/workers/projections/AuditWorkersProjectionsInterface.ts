import type { AuditWorkerProjectionDto } from '../dto';
export class AuditWorkersProjectionsInterface {
  public static creer(): AuditWorkerProjectionDto {
    return { timelines: true, analytics: true, monitoring: true, forensic: true, exportProjections: true };
  }
}

