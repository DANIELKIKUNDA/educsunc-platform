import type { AuditArchiveRepository } from '../../../../../domain/repositories';

// Cet ecrivain materialise l archivage logique sans reecriture de la source append-only.
export class PostgresAuditArchiveWriter {
  constructor(private readonly archiveRepository: AuditArchiveRepository) {}

  public async archiverLogiquement(params: {
    organisationId?: string;
    ecoleId?: string;
    typeArchive?: string;
    raisonArchivage?: string;
    dateLimite?: string;
  }): Promise<number> {
    return this.archiveRepository.archiver({
      organisationId: params.organisationId,
      ecoleId: params.ecoleId,
      typeArchive: params.typeArchive ?? 'LOGIQUE',
      raisonArchivage: params.raisonArchivage,
      dateLimite: params.dateLimite,
    });
  }
}

