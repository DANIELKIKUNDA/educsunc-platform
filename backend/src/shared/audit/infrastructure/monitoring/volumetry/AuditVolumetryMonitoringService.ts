import { PostgresAuditOperationalReader } from '../../persistence/postgres/repositories/PostgresAuditOperationalReader';

export class AuditVolumetryMonitoringService {
  public constructor(private readonly reader = new PostgresAuditOperationalReader()) {}

  public async obtenirSnapshot() {
    return {
      auditEntries: await this.reader.compterEntrees(),
      exports: await this.reader.compterDocuments('EXPORT'),
      projections: await this.reader.compterDocuments('PROJECTION'),
      archives: await this.reader.compterDocuments('ARCHIVE'),
      coldStoragePackages: await this.reader.compterDocuments('COLD_STORAGE'),
    };
  }
}
