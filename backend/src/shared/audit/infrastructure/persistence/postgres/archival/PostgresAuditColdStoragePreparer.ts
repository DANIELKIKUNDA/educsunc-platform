import type { AuditArchiveRepository } from '../../../../domain/repositories';
import type { AuditColdStoragePreparationReport } from './AuditArchivalTypes';

// Cette preparation garde la place du futur cold storage sans inventer encore la couche de stockage.
export class PostgresAuditColdStoragePreparer {
  constructor(private readonly archiveRepository: AuditArchiveRepository) {}

  public async preparer(params: {
    organisationId?: string;
    ecoleId?: string;
    typeArchive?: string;
  }): Promise<AuditColdStoragePreparationReport> {
    const totalPrepares = await this.archiveRepository.preparerStockageFroid({
      organisationId: params.organisationId,
      ecoleId: params.ecoleId,
      typeArchive: params.typeArchive ?? 'COLD_STORAGE',
    });

    return {
      totalCandidates: totalPrepares,
      totalPrepares,
      typeArchive: params.typeArchive ?? 'COLD_STORAGE',
    };
  }
}

