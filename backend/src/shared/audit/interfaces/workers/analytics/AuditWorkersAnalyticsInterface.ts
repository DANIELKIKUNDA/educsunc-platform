import type { AuditWorkerAnalyticsDto } from '../dto';
export class AuditWorkersAnalyticsInterface {
  public static creer(): AuditWorkerAnalyticsDto {
    return { tendances: true, volumetrie: true, anomalies: true, statistiques: true, aggregations: true };
  }
}

