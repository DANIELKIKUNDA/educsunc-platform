import { obtenirSharedEventBus } from '../../../../infrastructure/bus';
import type { AuditIntegrationEventDispatcher } from '../dispatchers/AuditIntegrationEventDispatcher';

// Ce service relance de facon controlee les evenements deja traces par le bus partage.
export class AuditIntegrationRetryService {
  public constructor(private readonly dispatcher: AuditIntegrationEventDispatcher) {}

  public async relancer(name?: string): Promise<number> {
    const events = obtenirSharedEventBus().lister().filter((event) => !name || event.name === name);
    for (const event of events) {
      await this.dispatcher.dispatch({
        ...event,
        metadata: {
          ...event.metadata,
          retryCount: event.metadata.retryCount + 1,
          retryTimestamp: new Date().toISOString(),
          retryHistory: [...event.metadata.retryHistory, event.metadata.eventId],
        },
      });
    }
    return events.length;
  }
}

