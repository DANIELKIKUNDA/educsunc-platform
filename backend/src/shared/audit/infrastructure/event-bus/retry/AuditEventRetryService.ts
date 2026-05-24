import { AuditEventConsumer } from '../consumers/AuditEventConsumer';
import { AuditDeadLetterQueue } from '../dead-letter/AuditDeadLetterQueue';
import type { AuditEventEnvelope } from '../EventBusTypes';

// Ce service relance les dead-letters de facon controlee en enrichissant la metadata retry.
export class AuditEventRetryService {
  constructor(
    private readonly consumer: AuditEventConsumer,
    private readonly deadLetterQueue: AuditDeadLetterQueue,
  ) {}

  public async relancerTous(): Promise<number> {
    const deadLetters = this.deadLetterQueue.lister();
    for (const deadLetter of deadLetters) {
      const retryEnvelope: AuditEventEnvelope = {
        ...deadLetter.envelope,
        metadata: {
          ...deadLetter.envelope.metadata,
          retryCount: deadLetter.envelope.metadata.retryCount + 1,
        },
      };
      await this.consumer.consommer(retryEnvelope);
    }
    return deadLetters.length;
  }
}

