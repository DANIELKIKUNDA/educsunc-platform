import { AuditDeduplicationService } from '../deduplication/AuditDeduplicationService';
import { AuditIdempotencyKeyBuilder } from '../keys/AuditIdempotencyKeyBuilder';

// Ce garde protege les rebuilds et retraitements de projections contre les doubles insertions.
export class AuditProjectionIdempotencyGuard {
  public constructor(
    private readonly deduplication: AuditDeduplicationService = new AuditDeduplicationService(),
    private readonly keyBuilder: AuditIdempotencyKeyBuilder = new AuditIdempotencyKeyBuilder(),
  ) {}

  public async peutProjeter(args: {
    idProjection: string;
    idAuditEntry: string;
    organisationId?: string;
    ecoleId?: string;
    scope?: string;
  }): Promise<boolean> {
    const cle = this.keyBuilder.depuisProjection(args);
    const decision = await this.deduplication.verifierEtVerrouiller({
      parts: {
        eventId: args.idAuditEntry,
        operationId: args.idProjection,
        organisationId: args.organisationId,
        ecoleId: args.ecoleId,
        scope: args.scope,
        sourceTraitement: 'PROJECTION_AUDIT',
      },
      nature: 'ORIGINAL',
    });

    if (decision.doitTraiter) {
      this.deduplication.liberer(cle);
    }

    return decision.doitTraiter;
  }
}
