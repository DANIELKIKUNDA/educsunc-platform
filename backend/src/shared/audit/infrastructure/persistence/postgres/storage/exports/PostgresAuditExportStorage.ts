import type { AuditExportRepository } from '../../../../../domain/repositories';
import type { AuditExportStorageDescriptor } from '../StorageAuditTypes';
import { PostgresAuditExportStorageAdapter } from './PostgresAuditExportStorageAdapter';

// Ce stockage export prepare des descripteurs de localisation controles et tenant-aware.
export class PostgresAuditExportStorage {
  private readonly adapter = new PostgresAuditExportStorageAdapter();

  constructor(private readonly exportRepository: AuditExportRepository) {}

  public async listerExportsStockes(filtres: { organisationId?: string; ecoleId?: string; acteurId?: string }): Promise<AuditExportStorageDescriptor[]> {
    const exports = await this.exportRepository.listerExports(filtres);
    return Promise.all(exports.map(async (ligne) => ({
      storageId: ligne.idAuditExport,
      zone: 'EXPORT' as const,
      type: ligne.formatExport,
      organisationId: ligne.organisationId,
      ecoleId: ligne.ecoleId,
      uri: await this.adapter.sauvegarderExport({
        exportId: ligne.idAuditExport,
        format: ligne.formatExport,
      }),
      creeLe: ligne.dateGeneration.toISOString(),
      tenantAware: true,
      forensicAware: true,
      exportRecord: ligne,
    })));
  }
}

