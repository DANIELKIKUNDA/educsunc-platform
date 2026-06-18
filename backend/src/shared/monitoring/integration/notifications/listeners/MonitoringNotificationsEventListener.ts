import { MonitoringNotificationsIntegrationOrchestrator } from '../orchestration/MonitoringNotificationsIntegrationOrchestrator';
import type { MonitoringNotificationsEvenement } from '../MonitoringNotificationsIntegrationTypes';

// Ce fichier declare le listener Notifications pour Monitoring.

export class MonitoringNotificationsEventListener {
  constructor(private readonly orchestrator = new MonitoringNotificationsIntegrationOrchestrator()) {}

  public async consommer(evenement: MonitoringNotificationsEvenement): Promise<void> {
    await this.orchestrator.publierEvenement(evenement);
  }

  public orchestrateur(): MonitoringNotificationsIntegrationOrchestrator {
    return this.orchestrator;
  }
}
