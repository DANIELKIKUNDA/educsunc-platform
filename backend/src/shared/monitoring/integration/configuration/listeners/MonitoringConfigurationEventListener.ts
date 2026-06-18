import { MonitoringConfigurationIntegrationOrchestrator } from '../orchestration/MonitoringConfigurationIntegrationOrchestrator';
import type { MonitoringConfigurationEvenement } from '../MonitoringConfigurationIntegrationTypes';

// Ce fichier declare le listener Configuration pour Monitoring.

export class MonitoringConfigurationEventListener {
  constructor(private readonly orchestrator = new MonitoringConfigurationIntegrationOrchestrator()) {}

  public async consommer(evenement: MonitoringConfigurationEvenement): Promise<void> {
    await this.orchestrator.synchroniserEvenement(evenement);
  }

  public orchestrateur(): MonitoringConfigurationIntegrationOrchestrator {
    return this.orchestrator;
  }
}
