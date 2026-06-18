import { MonitoringScolariteIntegrationOrchestrator } from '../orchestration/MonitoringScolariteIntegrationOrchestrator';
import type { MonitoringScolariteEvenement } from '../MonitoringScolariteIntegrationTypes';

// Ce fichier declare le listener Scolarite pour Monitoring.

export class MonitoringScolariteEventListener {
  constructor(private readonly orchestrator = new MonitoringScolariteIntegrationOrchestrator()) {}

  public async consommer(evenement: MonitoringScolariteEvenement): Promise<void> {
    await this.orchestrator.synchroniserEvenement(evenement);
  }
}
