import type { AuditEntry } from '../../../../domain/aggregates';
import type { AuditProjectionRepository } from '../../../../domain/repositories';
import { PostgresAuditProjectionProjector } from './PostgresAuditProjectionProjector';

// Ce rebuilder permet de recalculer les projections since audit_entries reste la seule verite.
export class PostgresAuditProjectionRebuilder {
  private readonly projector: PostgresAuditProjectionProjector;

  constructor(private readonly projectionRepository: AuditProjectionRepository) {
    this.projector = new PostgresAuditProjectionProjector(projectionRepository);
  }

  public async reconstruireFamille(typeProjection: string, entrees: readonly AuditEntry[]): Promise<void> {
    const existantes = await this.projectionRepository.listerProjections(typeProjection);
    for (const projection of existantes) {
      await this.projectionRepository.supprimerProjection(projection.idProjection);
    }

    for (const entree of entrees) {
      const projections = this.projector.construire(entree).filter((projection) => projection.typeProjection === typeProjection);
      for (const projection of projections) {
        await this.projectionRepository.enregistrerProjection(projection);
      }
    }
  }
}

