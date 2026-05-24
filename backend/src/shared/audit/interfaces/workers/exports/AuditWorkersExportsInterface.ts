import type { AuditWorkerExportDto } from '../dto';
export class AuditWorkersExportsInterface {
  public static creer(): AuditWorkerExportDto {
    return { pdf: true, csv: true, json: true, forensicBundles: true, analyticsExports: true, expiration: true };
  }
}

