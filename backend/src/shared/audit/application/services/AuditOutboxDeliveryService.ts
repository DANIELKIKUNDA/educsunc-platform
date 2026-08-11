import type { AuditOutboxPublisherPort, AuditOutboxRepositoryPort } from '../ports/outbound';

export type AuditOutboxObservation = {
  readonly type: 'claimed' | 'published' | 'retry' | 'dead' | 'worker_error';
  readonly idOutbox?: string;
  readonly eventId?: string;
  readonly attempt?: number;
  readonly message?: string;
};

export interface AuditOutboxDeliveryResult {
  readonly claimed: number;
  readonly published: number;
  readonly retries: number;
  readonly dead: number;
}

export class AuditOutboxDeliveryService {
  public constructor(
    private readonly repository: AuditOutboxRepositoryPort,
    private readonly publisher: AuditOutboxPublisherPort,
    private readonly observe: (observation: AuditOutboxObservation) => void = () => undefined,
    private readonly maxAttempts = 8,
    private readonly baseBackoffMs = 1_000,
  ) {}

  public async traiterLot(workerId: string, limit = 25, lockTimeoutMs = 60_000): Promise<AuditOutboxDeliveryResult> {
    const messages = await this.repository.reclamerLot(workerId, limit, lockTimeoutMs);
    const result = { claimed: messages.length, published: 0, retries: 0, dead: 0 };
    if (messages.length > 0) this.observe({ type: 'claimed', message: `${messages.length}` });

    for (const message of messages) {
      try {
        await this.publisher.publier(message);
        await this.repository.marquerPublie(message.idOutbox, workerId);
        result.published += 1;
        this.observe({ type: 'published', idOutbox: message.idOutbox, eventId: message.event.eventId });
      } catch (error) {
        const attempt = message.attemptCount + 1;
        const terminal = attempt >= this.maxAttempts;
        const backoff = Math.min(this.baseBackoffMs * 2 ** Math.max(0, attempt - 1), 60 * 60 * 1_000);
        const safeMessage = this.safeError(error);
        await this.repository.marquerEchec(
          message.idOutbox,
          workerId,
          safeMessage,
          new Date(Date.now() + backoff),
          terminal,
        );
        if (terminal) result.dead += 1;
        else result.retries += 1;
        this.observe({
          type: terminal ? 'dead' : 'retry',
          idOutbox: message.idOutbox,
          eventId: message.event.eventId,
          attempt,
          message: safeMessage,
        });
      }
    }
    return result;
  }

  private safeError(error: unknown): string {
    const raw = error instanceof Error ? error.message : 'Publication Audit impossible.';
    return raw
      .replace(/(token|password|secret|cookie|authorization)\s*[:=]\s*[^\s,;]+/gi, '$1=[MASQUE]')
      .slice(0, 1_000);
  }
}
