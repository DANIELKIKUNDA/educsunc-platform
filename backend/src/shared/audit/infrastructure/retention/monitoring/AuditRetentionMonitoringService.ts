import type { AuditExportRecord } from '../../../domain/repositories';
import { PostgresAuditDocumentStore } from '../../persistence/postgres/repositories/PostgresAuditDocumentStore';
import { PostgresAuditOperationalReader } from '../../persistence/postgres/repositories/PostgresAuditOperationalReader';
import type { AuditRetentionSnapshot } from '../RetentionTypes';

export class AuditRetentionMonitoringService {
  public constructor(
    private readonly reader = new PostgresAuditOperationalReader(),
    private readonly documents = new PostgresAuditDocumentStore(),
  ) {}

  public async obtenirSnapshot(): Promise<AuditRetentionSnapshot> {
    const exports = await this.documents.lister<AuditExportRecord>('EXPORT');
    return {
      totalActifs: await this.reader.compterEntrees(),
      totalArchives: await this.reader.compterDocuments('ARCHIVE'),
      totalColdStorage: await this.reader.compterDocuments('COLD_STORAGE'),
      totalExportsExpires: exports.filter((entry) => entry.dateExpiration instanceof Date && entry.dateExpiration.getTime() <= Date.now()).length,
      totalEligiblesPurge: await this.reader.compterDocuments('RETENTION_PURGE_DECISION'),
    };
  }
}
