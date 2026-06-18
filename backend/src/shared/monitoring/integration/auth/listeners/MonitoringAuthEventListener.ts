import { MonitoringAuthIntegrationOrchestrator } from '../orchestration/MonitoringAuthIntegrationOrchestrator';
import type { MonitoringAuthEvenement } from '../MonitoringAuthIntegrationTypes';

// Ce fichier declare le listener d evenements Auth pour Monitoring.

export class MonitoringAuthEventListener {
  constructor(private readonly orchestrator = new MonitoringAuthIntegrationOrchestrator()) {}

  public async consommer(evenement: MonitoringAuthEvenement): Promise<void> {
    await this.orchestrator.synchroniserEvenement(evenement);
  }

  public orchestrateur(): MonitoringAuthIntegrationOrchestrator {
    return this.orchestrator;
  }
}
