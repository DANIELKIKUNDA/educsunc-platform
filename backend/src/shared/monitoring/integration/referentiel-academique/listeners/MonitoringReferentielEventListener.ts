import { MonitoringReferentielIntegrationOrchestrator } from '../orchestration/MonitoringReferentielIntegrationOrchestrator';
import type { MonitoringReferentielEvenement } from '../MonitoringReferentielIntegrationTypes';

// Ce fichier declare le listener Referentiel pour Monitoring.

export class MonitoringReferentielEventListener {
  constructor(private readonly orchestrator = new MonitoringReferentielIntegrationOrchestrator()) {}

  public async consommer(evenement: MonitoringReferentielEvenement): Promise<void> {
    await this.orchestrator.synchroniserEvenement(evenement);
  }
}
