import type { AuditEventEnvelope } from '../../event-bus';
import { AuditDeduplicationService } from '../deduplication/AuditDeduplicationService';
import { AuditIdempotencyKeyBuilder } from '../keys/AuditIdempotencyKeyBuilder';

// Les handlers critiques doivent reconnaitre original, replay, retry et duplication ignoree.
export class AuditHandlerIdempotencyGuard {
  public constructor(
    private readonly deduplication: AuditDeduplicationService = new AuditDeduplicationService(),
    private readonly keyBuilder: AuditIdempotencyKeyBuilder = new AuditIdempotencyKeyBuilder(),
  ) {}

  public async proteger(envelope: AuditEventEnvelope, sourceTraitement: string): Promise<boolean> {
    const cleIdempotence = this.keyBuilder.depuisEvenement(envelope, sourceTraitement);
    const decision = await this.deduplication.verifierEtVerrouiller({
      parts: {
        eventId: envelope.metadata.eventId,
        replayId: envelope.metadata.replayId,
        syncId: envelope.metadata.syncId,
        requestId: envelope.metadata.requestId,
        organisationId: envelope.metadata.organisationId,
        ecoleId: envelope.metadata.ecoleId,
        scope: envelope.metadata.scope,
        sourceTraitement,
      },
      nature: envelope.metadata.replay ? 'REPLAY' : envelope.metadata.retryCount > 0 ? 'RETRY' : 'ORIGINAL',
    });

    if (!decision.doitTraiter) {
      return false;
    }

    this.deduplication.liberer(cleIdempotence);
    return true;
  }
}
