import type { AuditArchiveRepository } from '../../../../../domain/repositories';
import type { AuditArchiveRestorationReport } from '../AuditArchivalTypes';

// Ce service restaure des archives logiques de facon controlee et tracable.
export class PostgresAuditArchiveRestorationService {
  constructor(private readonly archiveRepository: AuditArchiveRepository) {}

  public async restaurer(archiveIds: readonly string[]): Promise<AuditArchiveRestorationReport> {
    const totalRestaurees = await this.archiveRepository.restaurerArchives([...archiveIds]);
    return {
      totalDemandes: archiveIds.length,
      totalRestaurees,
      archiveIdsRestaurees: [...archiveIds].slice(0, totalRestaurees),
    };
  }
}

