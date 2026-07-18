import type { AuditArchiveRepository, AuditEntryRepository } from '../../../../../domain/repositories';
import { PostgresAuditDocumentStore } from '../../repositories/PostgresAuditDocumentStore';
import type { AuditColdStoragePreparationResult, AuditColdStorageSearchFilters } from '../AuditColdStorageTypes';
import { AuditColdStoragePackageBuilder } from '../packages/AuditColdStoragePackageBuilder';

// Cet ecrivain deplace logiquement des archives vers un stockage froid reconstructible.
export class PostgresAuditColdStorageWriter {
  private readonly builder = new AuditColdStoragePackageBuilder();
  private readonly documents = new PostgresAuditDocumentStore();

  constructor(
    private readonly archiveRepository: AuditArchiveRepository,
    private readonly auditEntryRepository: AuditEntryRepository,
  ) {}

  public async preparerPaquet(
    filtres: AuditColdStorageSearchFilters,
    formatStockage: 'OBJECT_STORAGE' | 'ENCRYPTED_BACKUP' | 'COMPRESSED_ARCHIVE' | 'CLOUD_COLD' = 'COMPRESSED_ARCHIVE',
  ): Promise<AuditColdStoragePreparationResult> {
    const archives = await this.archiveRepository.rechercherArchives({
      organisationId: filtres.organisationId,
      ecoleId: filtres.ecoleId,
      typeArchive: filtres.typeArchive,
    });
    const entrees = (
      await Promise.all(archives.map((archive) => this.auditEntryRepository.trouverParId(archive.idAuditEntry)))
    ).filter((entree): entree is NonNullable<typeof entree> => entree !== null);

    const paquet = this.builder.construire({
      archives,
      entrees,
      formatStockage,
    });
    await this.documents.enregistrer('COLD_STORAGE', paquet.packageId, {
      ...paquet,
      archives: [...paquet.archives],
      auditEntryIds: [...paquet.auditEntryIds],
      forensic: {
        ...paquet.forensic,
        correlationIds: [...paquet.forensic.correlationIds],
        requestIds: [...paquet.forensic.requestIds],
        deviceIds: [...paquet.forensic.deviceIds],
        acteurIds: [...paquet.forensic.acteurIds],
        ressourcesIds: [...paquet.forensic.ressourcesIds],
      },
      chronologie: { ...paquet.chronologie },
    });

    return {
      totalArchives: paquet.totalArchives,
      totalAudits: paquet.totalAudits,
      packageId: paquet.packageId,
      formatStockage: paquet.formatStockage,
    };
  }
}
