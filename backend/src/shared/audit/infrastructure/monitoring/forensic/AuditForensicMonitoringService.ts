import { PostgresAuditOperationalReader } from '../../persistence/postgres/repositories/PostgresAuditOperationalReader';

export class AuditForensicMonitoringService {
  public constructor(private readonly reader = new PostgresAuditOperationalReader()) {}

  public async obtenirSnapshot() {
    return {
      totalLiensForensic: await this.reader.compterDocuments('FORENSIC_LINK'),
      totalPackagesColdStorage: await this.reader.compterDocuments('COLD_STORAGE'),
      totalCorrelations: await this.reader.compterCorrelations(),
    };
  }
}
