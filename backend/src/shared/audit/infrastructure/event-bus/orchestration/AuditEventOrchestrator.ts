import { randomUUID } from 'node:crypto';
import type { EventBusPort } from '../../../application/ports/outbound';
import { AuditDeadLetterQueue } from '../dead-letter/AuditDeadLetterQueue';
import { AuditEventConsumer } from '../consumers/AuditEventConsumer';
import { AuditEventDispatcher } from '../dispatchers/AuditEventDispatcher';
import { AuditEventIdempotencyGuard } from '../idempotency/AuditEventIdempotencyGuard';
import { AuditNotificationEventConsumer } from '../notifications/AuditNotificationEventConsumer';
import { AuditProjectionEventConsumer } from '../projections/AuditProjectionEventConsumer';
import { AuditSecurityEventConsumer } from '../security/AuditSecurityEventConsumer';
import { obtenirAuditEventMemoryStore } from '../stores/AuditEventMemoryStore';
import { AuditSynchronizationEventConsumer } from '../synchronization/AuditSynchronizationEventConsumer';
import type { AuditEventEnvelope } from '../EventBusTypes';
import type { PostgresAuditProjectionHandler } from '../../persistence/postgres/projections';

// Cet orchestrateur constitue le coeur vivant du bus Audit : publier -> stocker -> consommer -> rejouer.
export class AuditEventOrchestrator implements EventBusPort {
  private readonly dispatcher = new AuditEventDispatcher();
  private readonly idempotencyGuard = new AuditEventIdempotencyGuard();
  private readonly deadLetterQueue = new AuditDeadLetterQueue();
  private readonly consumer = new AuditEventConsumer(this.dispatcher, this.idempotencyGuard, this.deadLetterQueue);

  constructor(projectionHandler: PostgresAuditProjectionHandler) {
    this.dispatcher.enregistrer(new AuditProjectionEventConsumer(projectionHandler));
    this.dispatcher.enregistrer(new AuditSecurityEventConsumer());
    this.dispatcher.enregistrer(new AuditSynchronizationEventConsumer());
    this.dispatcher.enregistrer(new AuditNotificationEventConsumer());
  }

  public async publier(name: string, payload: Record<string, unknown>): Promise<void> {
    const envelope: AuditEventEnvelope = {
      name,
      payload,
      metadata: {
        eventId: typeof payload.eventId === 'string' ? payload.eventId : randomUUID(),
        correlationId: typeof payload.correlationId === 'string' ? payload.correlationId : undefined,
        requestId: typeof payload.requestId === 'string' ? payload.requestId : undefined,
        sessionId: typeof payload.sessionId === 'string' ? payload.sessionId : undefined,
        replayId: typeof payload.replayId === 'string' ? payload.replayId : undefined,
        syncId: typeof payload.syncId === 'string' ? payload.syncId : undefined,
        organisationId: typeof payload.organisationId === 'string' ? payload.organisationId : undefined,
        ecoleId: typeof payload.ecoleId === 'string' ? payload.ecoleId : undefined,
        scope: typeof payload.scope === 'string' ? payload.scope : undefined,
        replay: payload.replay === true,
        retryCount: typeof payload.retryCount === 'number' ? payload.retryCount : 0,
        occurredAt: typeof payload.dateAction === 'string' ? payload.dateAction : new Date().toISOString(),
      },
    };

    obtenirAuditEventMemoryStore().events.push(envelope);
    await this.consumer.consommer(envelope);
  }

  public obtenirConsumer(): AuditEventConsumer {
    return this.consumer;
  }

  public obtenirDeadLetters(): AuditDeadLetterQueue {
    return this.deadLetterQueue;
  }
}

