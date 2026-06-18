import { MonitoringBulletinsIntegrationOrchestrator } from '../orchestration/MonitoringBulletinsIntegrationOrchestrator';
import type { MonitoringBulletinsEvenement } from '../MonitoringBulletinsIntegrationTypes';

// Ce fichier declare le listener Bulletins pour Monitoring.

export class MonitoringBulletinsEventListener {
  constructor(private readonly orchestrator = new MonitoringBulletinsIntegrationOrchestrator()) {}

  public async consommer(evenement: MonitoringBulletinsEvenement): Promise<void> {
    await this.orchestrator.synchroniserEvenement(evenement);
  }
}
