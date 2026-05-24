import { AuditIdempotencyKeyBuilder } from '../keys/AuditIdempotencyKeyBuilder';
import { PostgresAuditIdempotencyStore } from '../stores/PostgresAuditIdempotencyStore';
import type {
  AuditIdempotencyDecision,
  AuditIdempotencyEvaluationRequest,
  AuditIdempotencyKeyParts,
  AuditIdempotencyRegistration,
} from '../IdempotencyTypes';

// Ce service centralise la decision idempotente avant tout traitement critique.
export class AuditIdempotencyService {
  public constructor(
    private readonly store: PostgresAuditIdempotencyStore = new PostgresAuditIdempotencyStore(),
    private readonly keyBuilder: AuditIdempotencyKeyBuilder = new AuditIdempotencyKeyBuilder(),
  ) {}

  public construireCle(parts: AuditIdempotencyKeyParts): string {
    return this.keyBuilder.construire(parts);
  }

  public async evaluerTraitement(
    request: AuditIdempotencyEvaluationRequest,
  ): Promise<AuditIdempotencyDecision> {
    const cleIdempotence = this.construireCle(request.parts);
    const enregistrementExistant = await this.store.retrouver(cleIdempotence);

    if (enregistrementExistant) {
      this.store.marquerDoublonIgnore();
      return {
        cleIdempotence,
        dejaTraite: true,
        doitTraiter: false,
        nature: 'DUPLICATION_IGNOREE',
        raison: 'Traitement deja execute pour cette cle idempotente.',
        enregistrementExistant,
      };
    }

    return {
      cleIdempotence,
      dejaTraite: false,
      doitTraiter: true,
      nature: request.nature,
      raison: 'Traitement autorise pour cette cle idempotente.',
    };
  }

  public async enregistrerTraitement(enregistrement: AuditIdempotencyRegistration): Promise<void> {
    await this.store.enregistrer(enregistrement);
  }
}
