import { PostgresAuditColdStorageFacade } from '../../cold-storage';
import { PostgresAuditArchivalFacade } from '../../archival';
import { PostgresAuditExportStorage } from '../exports/PostgresAuditExportStorage';
import type { AuditRecoveryStorageReport } from '../StorageAuditTypes';

// Ce recovery unifie la restauration archive, cold storage et la rehydratation des exports traces.
export class PostgresAuditRecoveryStorage {
  constructor(
    private readonly archivalFacade: PostgresAuditArchivalFacade,
    private readonly coldStorageFacade: PostgresAuditColdStorageFacade,
    private readonly exportStorage: PostgresAuditExportStorage,
  ) {}

  public async restaurerDepuisStockage(params: {
    archiveIds?: readonly string[];
    coldStoragePackageId?: string;
    organisationId?: string;
    ecoleId?: string;
  }): Promise<AuditRecoveryStorageReport> {
    const archiveRestore = params.archiveIds && params.archiveIds.length > 0
      ? await this.archivalFacade.restoration.restaurer(params.archiveIds)
      : { totalArchivesRestaurees: 0 };

    const coldRestore = params.coldStoragePackageId
      ? await this.coldStorageFacade.restoration.restaurer(params.coldStoragePackageId)
      : { totalArchivesRestaurees: 0 };

    const exports = await this.exportStorage.listerExportsStockes({
      organisationId: params.organisationId,
      ecoleId: params.ecoleId,
    });

    return {
      totalArchivesRestaurees: 'totalRestaurees' in archiveRestore
        ? archiveRestore.totalRestaurees
        : archiveRestore.totalArchivesRestaurees,
      totalColdStorageRestaurees: coldRestore.totalArchivesRestaurees,
      totalExportsRehydrates: exports.length,
    };
  }
}
