import type { AuditExportRepository } from '../../../domain/repositories';
import { PostgresAuditExportRepository } from '../../persistence/postgres/repositories';
import { PostgresAuditExportStorage } from '../../persistence/postgres/storage';
import type { AuditGeneratedExport } from '../ExportInfrastructureTypes';

// Le stockage export reste persistant, recuperable, traçable et prêt pour objet/cloud plus tard.
export class AuditExportStorageService {
  private readonly storage: PostgresAuditExportStorage;

  public constructor(
    private readonly repository: AuditExportRepository = new PostgresAuditExportRepository(),
  ) {
    this.storage = new PostgresAuditExportStorage(this.repository);
  }

  public async stocker(exportGenere: AuditGeneratedExport): Promise<string | undefined> {
    const descriptors = await this.storage.listerExportsStockes({
      organisationId: exportGenere.organisationId,
      ecoleId: exportGenere.ecoleId,
      acteurId: exportGenere.acteurId,
    });
    return descriptors.find((descriptor) => descriptor.storageId === exportGenere.exportId)?.uri;
  }
}
