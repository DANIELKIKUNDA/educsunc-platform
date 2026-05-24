import { PostgresAuditArchiveRepository, PostgresAuditEntryRepository } from '../../persistence/postgres/repositories';
import { PostgresAuditColdStorageFacade } from '../../persistence/postgres/cold-storage/PostgresAuditColdStorageFacade';

// La retention peut déplacer les archives anciennes vers le cold storage.
export class AuditRetentionColdStorageService {
  private readonly coldStorage = new PostgresAuditColdStorageFacade(
    new PostgresAuditArchiveRepository(),
    new PostgresAuditEntryRepository(),
  );

  public async deplacerVersColdStorage(args: {
    typeArchive: string;
    organisationId?: string;
    ecoleId?: string;
    scope?: string;
  }): Promise<string> {
    const packageGenere = await this.coldStorage.writer.preparerPaquet({
      typeArchive: args.typeArchive,
      organisationId: args.organisationId,
      ecoleId: args.ecoleId,
    }, 'COMPRESSED_ARCHIVE');
    return packageGenere.packageId;
  }
}
