import { MonitoringSyncBridge } from '../bridges/MonitoringSyncBridge';
import { MonitoringSyncMapper } from '../mappers/MonitoringSyncMapper';
import type { MonitoringSyncEvenement } from '../MonitoringSyncIntegrationTypes';

// Ce fichier orchestre le pont Sync vers Monitoring.

export class MonitoringSyncIntegrationOrchestrator {
  public readonly bridge = new MonitoringSyncBridge();

  public async synchroniserEvenement(evenement: MonitoringSyncEvenement): Promise<void> {
    this.bridge.synchroniser(evenement);
  }

  public snapshot(): readonly { readonly type: string; readonly resourceId: string; readonly score: number }[] {
    return this.bridge.lister().map((evenement) => MonitoringSyncMapper.versProjection(evenement));
  }
}
