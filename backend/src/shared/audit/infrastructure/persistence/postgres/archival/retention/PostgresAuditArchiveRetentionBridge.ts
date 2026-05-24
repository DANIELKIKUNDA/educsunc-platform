import type { AuditArchiveRepository, AuditRetentionRepository } from '../../../../../domain/repositories';
import type { AuditArchivePreparationPlan } from '../AuditArchivalTypes';

// Ce pont relie l archivage a la retention pour preparer les cycles de vie sans duplication de logique.
export class PostgresAuditArchiveRetentionBridge {
  constructor(
    private readonly archiveRepository: AuditArchiveRepository,
    private readonly retentionRepository: AuditRetentionRepository,
  ) {}

  public async preparer(reference: Date, filtres?: { organisationId?: string; ecoleId?: string }): Promise<AuditArchivePreparationPlan> {
    const [archivesExistantes, archivables, purgeables] = await Promise.all([
      this.archiveRepository.rechercherArchives({
        organisationId: filtres?.organisationId,
        ecoleId: filtres?.ecoleId,
      }),
      this.retentionRepository.listerArchivables(reference),
      this.retentionRepository.listerPurgeables(reference),
    ]);

    return {
      reference: reference.toISOString(),
      totalArchivables: archivables.length,
      totalArchivesExistantes: archivesExistantes.length,
      totalPurgeables: purgeables.length,
      archivesCandidates: archivables,
    };
  }
}

