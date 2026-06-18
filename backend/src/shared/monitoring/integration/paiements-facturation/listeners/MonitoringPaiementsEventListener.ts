import { MonitoringPaiementsIntegrationOrchestrator } from '../orchestration/MonitoringPaiementsIntegrationOrchestrator';
import type { MonitoringPaiementsEvenement } from '../MonitoringPaiementsIntegrationTypes';

// Ce fichier declare le listener Paiements pour Monitoring.

export class MonitoringPaiementsEventListener {
  constructor(private readonly orchestrator = new MonitoringPaiementsIntegrationOrchestrator()) {}

  public async consommer(evenement: MonitoringPaiementsEvenement): Promise<void> {
    await this.orchestrator.synchroniserEvenement(evenement);
  }
}
