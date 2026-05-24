import { AuditEventConsumer } from '../consumers/AuditEventConsumer';
import { obtenirAuditEventMemoryStore } from '../stores/AuditEventMemoryStore';
import type { AuditEventEnvelope } from '../EventBusTypes';

// Ce service rejoue les evenements stockes en preservant leur metadata de replay.
export class AuditEventReplayService {
  constructor(private readonly consumer: AuditEventConsumer) {}

  public async rejouer(eventName?: string): Promise<number> {
    const events = obtenirAuditEventMemoryStore().events.filter((event) => !eventName || event.name === eventName);
    for (const event of events) {
      const replayEnvelope: AuditEventEnvelope = {
        ...event,
        metadata: {
          ...event.metadata,
          replay: true,
          retryCount: event.metadata.retryCount,
          replayId: event.metadata.replayId ?? event.metadata.eventId,
        },
      };
      await this.consumer.consommer(replayEnvelope);
    }
    return events.length;
  }
}

