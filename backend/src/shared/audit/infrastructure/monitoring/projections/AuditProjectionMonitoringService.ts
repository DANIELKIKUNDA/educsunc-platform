import { PostgresAuditOperationalReader } from '../../persistence/postgres/repositories/PostgresAuditOperationalReader';

export class AuditProjectionMonitoringService {
  public constructor(private readonly reader = new PostgresAuditOperationalReader()) {}

  public async obtenirSnapshot() {
    return {
      totalProjections: await this.reader.compterDocuments('PROJECTION'),
      totalAnalyticsSnapshots: await this.reader.compterDocuments('ANALYTICS'),
    };
  }
}
