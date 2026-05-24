import { obtenirSharedEventBus } from '../../../../infrastructure/bus';
import type { AuditIntegrationEventDispatcher } from '../dispatchers/AuditIntegrationEventDispatcher';

// Ce service rejoue les evenements du bus partage en preservant la chaine de correlation.
export class AuditIntegrationReplayService {
  public constructor(private readonly dispatcher: AuditIntegrationEventDispatcher) {}

  public async rejouer(name?: string): Promise<number> {
    const events = obtenirSharedEventBus().lister().filter((event) => !name || event.name === name);
    for (const event of events) {
      await this.dispatcher.dispatch(event);
    }
    return events.length;
  }
}

