import type { RealtimeMonitoringEvenement } from '../RealtimeMonitoringIntegrationTypes';

const journal: RealtimeMonitoringEvenement[] = [];

export class RealtimeMonitoringPublisher {
  public async publier(evenement: RealtimeMonitoringEvenement): Promise<void> {
    journal.push(evenement);
  }

  public journal(): readonly RealtimeMonitoringEvenement[] {
    return [...journal];
  }
}
