import type { AuditArchiveRepository } from '../../../../../domain/repositories';
import type { AuditArchiveSearchFilters } from '../AuditArchivalTypes';

// Ce lecteur centralise les consultations archive tenant-aware sans exposer le repository brut.
export class PostgresAuditArchiveReader {
  constructor(private readonly archiveRepository: AuditArchiveRepository) {}

  public async lireArchives(filtres: AuditArchiveSearchFilters) {
    const archives = await this.archiveRepository.rechercherArchives({
      organisationId: filtres.organisationId,
      ecoleId: filtres.ecoleId,
      typeArchive: filtres.typeArchive,
    });
    if (!filtres.archiveIds || filtres.archiveIds.length === 0) {
      return archives;
    }

    const ids = new Set(filtres.archiveIds);
    return archives.filter((archive) => ids.has(archive.idArchive));
  }

  public async lireParPerimetreTenant(filtres: Pick<AuditArchiveSearchFilters, 'organisationId' | 'ecoleId' | 'typeArchive'>) {
    return this.archiveRepository.rechercherArchives({
      organisationId: filtres.organisationId,
      ecoleId: filtres.ecoleId,
      typeArchive: filtres.typeArchive,
    });
  }
}
