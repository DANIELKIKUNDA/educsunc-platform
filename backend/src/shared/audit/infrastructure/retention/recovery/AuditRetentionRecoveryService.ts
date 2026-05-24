import { PostgresAuditArchiveRepository, PostgresAuditEntryRepository } from '../../persistence/postgres/repositories';
import { PostgresAuditArchiveRestorationService } from '../../persistence/postgres/archival/restoration/PostgresAuditArchiveRestorationService';
import { PostgresAuditColdStorageReader } from '../../persistence/postgres/cold-storage/readers/PostgresAuditColdStorageReader';
import { PostgresAuditColdStorageRestorationService } from '../../persistence/postgres/cold-storage/restoration/PostgresAuditColdStorageRestorationService';

export class AuditRetentionRecoveryService {
  private readonly archiveRestoration = new PostgresAuditArchiveRestorationService(new PostgresAuditArchiveRepository());
  private readonly coldStorageRestoration = new PostgresAuditColdStorageRestorationService(
    new PostgresAuditColdStorageReader(),
    new PostgresAuditArchiveRepository(),
    new PostgresAuditEntryRepository(),
  );

  public async restaurerArchive(idArchive: string) {
    return this.archiveRestoration.restaurer([idArchive]);
  }

  public async restaurerColdStorage(packageId: string) {
    return this.coldStorageRestoration.restaurer(packageId);
  }
}
