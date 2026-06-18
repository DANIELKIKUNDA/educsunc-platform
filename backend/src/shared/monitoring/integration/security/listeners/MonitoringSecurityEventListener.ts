import { MonitoringSecurityIntegrationOrchestrator } from '../orchestration/MonitoringSecurityIntegrationOrchestrator';
import type { MonitoringSecurityEvenement } from '../MonitoringSecurityIntegrationTypes';

// Ce fichier declare le listener d evenements Security pour Monitoring.

export class MonitoringSecurityEventListener {
  constructor(private readonly orchestrator = new MonitoringSecurityIntegrationOrchestrator()) {}

  public async consommer(evenement: MonitoringSecurityEvenement): Promise<void> {
    await this.orchestrator.synchroniserEvenement(evenement);
  }

  public orchestrateur(): MonitoringSecurityIntegrationOrchestrator {
    return this.orchestrator;
  }
}
