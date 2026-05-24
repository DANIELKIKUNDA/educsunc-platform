import type { AuditArchiveRepository, AuditEntryRepository } from '../../../../../domain/repositories';
import type { AuditColdStorageRestorationResult } from '../AuditColdStorageTypes';
import { PostgresAuditColdStorageReader } from '../readers/PostgresAuditColdStorageReader';

// Ce service permet la restauration ciblee a partir d un paquet froid.
export class PostgresAuditColdStorageRestorationService {
  constructor(
    private readonly reader: PostgresAuditColdStorageReader,
    private readonly archiveRepository: AuditArchiveRepository,
    private readonly auditEntryRepository: AuditEntryRepository,
  ) {}

  public async restaurer(packageId: string): Promise<AuditColdStorageRestorationResult> {
    const paquet = await this.reader.lireUnitaire(packageId);
    if (!paquet) {
      return { packageId, totalArchivesRestaurees: 0, totalAuditsRestaurees: 0 };
    }

    for (const archive of paquet.archives) {
      await this.archiveRepository.enregistrerArchive(archive);
    }

    let totalAuditsRestaurees = 0;
    for (const idAuditEntry of paquet.auditEntryIds) {
      if (await this.auditEntryRepository.existe(idAuditEntry)) {
        totalAuditsRestaurees += 1;
      }
    }

    return {
      packageId,
      totalArchivesRestaurees: paquet.archives.length,
      totalAuditsRestaurees,
    };
  }
}

