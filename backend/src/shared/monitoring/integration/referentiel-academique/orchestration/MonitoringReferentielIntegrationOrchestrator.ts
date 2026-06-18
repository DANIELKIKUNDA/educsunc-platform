import { MonitoringReferentielAntiCorruptionLayer } from '../acl/MonitoringReferentielAntiCorruptionLayer';
import type { MonitoringReferentielEvenement } from '../MonitoringReferentielIntegrationTypes';

// Ce fichier orchestre le pont Referentiel vers Monitoring.

export class MonitoringReferentielIntegrationOrchestrator {
  public readonly acl = new MonitoringReferentielAntiCorruptionLayer();
  private readonly evenements: MonitoringReferentielEvenement[] = [];

  public async synchroniserEvenement(evenement: MonitoringReferentielEvenement): Promise<void> {
    this.evenements.push(evenement);
  }

  public snapshot(): readonly { readonly type: string; readonly composant: string }[] {
    return this.evenements.map((evenement) => this.acl.traduire(evenement));
  }
}
