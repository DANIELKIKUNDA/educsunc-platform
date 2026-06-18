import type { MonitoringSyncEvenement } from '../MonitoringSyncIntegrationTypes';

// Ce fichier declare le pont Sync vers Monitoring.

export class MonitoringSyncBridge {
  private readonly evenements: MonitoringSyncEvenement[] = [];

  public synchroniser(evenement: MonitoringSyncEvenement): void {
    this.evenements.push(evenement);
  }

  public lister(): readonly MonitoringSyncEvenement[] {
    return [...this.evenements];
  }
}
