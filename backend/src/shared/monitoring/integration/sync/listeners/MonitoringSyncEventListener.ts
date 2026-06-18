import { MonitoringSyncIntegrationOrchestrator } from '../orchestration/MonitoringSyncIntegrationOrchestrator';
import type { MonitoringSyncEvenement } from '../MonitoringSyncIntegrationTypes';

// Ce fichier declare le listener Sync pour Monitoring.

export class MonitoringSyncEventListener {
  constructor(private readonly orchestrator = new MonitoringSyncIntegrationOrchestrator()) {}

  public async consommer(evenement: MonitoringSyncEvenement): Promise<void> {
    await this.orchestrator.synchroniserEvenement(evenement);
  }
}
