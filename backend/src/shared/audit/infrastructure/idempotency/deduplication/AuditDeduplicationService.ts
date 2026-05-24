import { AuditIdempotencyService } from '../services/AuditIdempotencyService';
import { PostgresAuditIdempotencyStore } from '../stores/PostgresAuditIdempotencyStore';
import type { AuditIdempotencyDecision, AuditIdempotencyEvaluationRequest } from '../IdempotencyTypes';

// Cette couche applique compare-and-set leger avant traitement distribue ou asynchrone.
export class AuditDeduplicationService {
  public constructor(
    private readonly service: AuditIdempotencyService = new AuditIdempotencyService(),
    private readonly store: PostgresAuditIdempotencyStore = new PostgresAuditIdempotencyStore(),
  ) {}

  public async verifierEtVerrouiller(
    request: AuditIdempotencyEvaluationRequest,
  ): Promise<AuditIdempotencyDecision> {
    const decision = await this.service.evaluerTraitement(request);
    if (!decision.doitTraiter) {
      return decision;
    }

    if (!this.store.verrouiller(decision.cleIdempotence)) {
      return {
        cleIdempotence: decision.cleIdempotence,
        dejaTraite: false,
        doitTraiter: false,
        nature: 'DUPLICATION_IGNOREE',
        raison: 'Une autre execution traite deja cette cle idempotente.',
      };
    }

    return decision;
  }

  public liberer(cleIdempotence: string): void {
    this.store.liberer(cleIdempotence);
  }
}
