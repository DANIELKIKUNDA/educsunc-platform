import { AuditDeadLetterQueue } from '../dead-letter/AuditDeadLetterQueue';
import { AuditEventDispatcher } from '../dispatchers/AuditEventDispatcher';
import { AuditEventIdempotencyGuard } from '../idempotency/AuditEventIdempotencyGuard';
import type { AuditEventEnvelope } from '../EventBusTypes';

// Ce consumer applique la discipline idempotence + dispatch + dead-letter.
export class AuditEventConsumer {
  constructor(
    private readonly dispatcher: AuditEventDispatcher,
    private readonly idempotencyGuard: AuditEventIdempotencyGuard,
    private readonly deadLetterQueue: AuditDeadLetterQueue,
  ) {}

  public async consommer(envelope: AuditEventEnvelope): Promise<void> {
    if (this.idempotencyGuard.dejaTraite(envelope)) {
      return;
    }

    try {
      await this.dispatcher.dispatch(envelope);
      this.idempotencyGuard.marquerTraite(envelope);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Echec inconnu de consommation event-bus Audit';
      this.deadLetterQueue.ajouter(envelope, reason);
      throw error;
    }
  }
}

