import type { AuditExportRepository } from '../../../domain/repositories';
import { PostgresAuditExportRepository } from '../../persistence/postgres/repositories';

// Les exports massifs doivent etre batchés et paginés pour rester stables.
export class AuditExportBatchingService {
  public constructor(
    private readonly repository: AuditExportRepository = new PostgresAuditExportRepository(),
  ) {}

  public async chargerLots(
    filtres: Record<string, unknown>,
    tailleLot = 500,
  ): Promise<Record<string, unknown>[][]> {
    const batches: Record<string, unknown>[][] = [];
    let curseur: string | undefined;
    do {
      const result = await this.repository.preparerExportBatch(filtres, { curseur, tailleLot });
      batches.push(
        result.lignes.map((ligne) => ({
          idAuditExport: ligne.idAuditExport,
          idAuditEntry: ligne.idAuditEntry,
          acteurId: ligne.acteurId,
          formatExport: ligne.formatExport,
          nombreElements: ligne.nombreElements,
          dateGeneration: ligne.dateGeneration.toISOString(),
          dateExpiration: ligne.dateExpiration?.toISOString(),
          organisationId: ligne.organisationId,
          ecoleId: ligne.ecoleId,
        })),
      );
      curseur = result.curseurSuivant;
    } while (curseur);
    return batches;
  }
}
