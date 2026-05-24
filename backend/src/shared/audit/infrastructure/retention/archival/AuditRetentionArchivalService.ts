import { PostgresAuditArchiveRepository, PostgresAuditRetentionRepository } from '../../persistence/postgres/repositories';
import { PostgresAuditArchivalFacade } from '../../persistence/postgres/archival/PostgresAuditArchivalFacade';
import type { AuditRetentionCandidate } from '../RetentionTypes';

// La retention prépare et déclenche l archivage sans confondre archive et purge.
export class AuditRetentionArchivalService {
  private readonly archival = new PostgresAuditArchivalFacade(
    new PostgresAuditArchiveRepository(),
    new PostgresAuditRetentionRepository(),
  );

  public async archiver(candidate: AuditRetentionCandidate): Promise<void> {
    await this.archival.writer.archiverLogiquement({
      typeArchive: 'RETENTION',
      organisationId: candidate.organisationId,
      ecoleId: candidate.ecoleId,
      dateLimite: candidate.dateAction,
      raisonArchivage: `RETENTION:${candidate.lifecycleState}`,
    });
  }
}
