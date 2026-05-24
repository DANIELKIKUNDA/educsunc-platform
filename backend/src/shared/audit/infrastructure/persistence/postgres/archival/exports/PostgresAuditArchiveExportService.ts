import { randomUUID } from 'node:crypto';
import type { AuditArchiveRepository } from '../../../../../domain/repositories';
import type { ArchiveStoragePort } from '../../../../../application/ports/outbound/ArchiveStoragePort';
import type { AuditArchiveExportEnvelope, AuditArchiveSearchFilters } from '../AuditArchivalTypes';

// Ce service prepare des exports d archives deja filtrees et tenant-aware.
export class PostgresAuditArchiveExportService {
  constructor(
    private readonly archiveRepository: AuditArchiveRepository,
    private readonly archiveStoragePort: ArchiveStoragePort,
  ) {}

  public async exporterArchives(
    filtres: AuditArchiveSearchFilters,
    format: 'JSON' | 'CSV' = 'JSON',
  ): Promise<AuditArchiveExportEnvelope> {
    const archives = await this.archiveRepository.rechercherArchives({
      organisationId: filtres.organisationId,
      ecoleId: filtres.ecoleId,
      typeArchive: filtres.typeArchive,
    });
    const exportId = randomUUID();
    const urlTemporaire = await this.archiveStoragePort.archiver({
      exportId,
      format,
      archives,
      organisationId: filtres.organisationId,
      ecoleId: filtres.ecoleId,
    });

    return {
      exportId,
      format,
      archives,
      urlTemporaire,
    };
  }
}
