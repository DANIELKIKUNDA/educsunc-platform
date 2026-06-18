import { MonitoringPaiementsAntiCorruptionLayer } from '../acl/MonitoringPaiementsAntiCorruptionLayer';
import type { MonitoringPaiementsEvenement } from '../MonitoringPaiementsIntegrationTypes';

// Ce fichier orchestre le pont Paiements vers Monitoring.

export class MonitoringPaiementsIntegrationOrchestrator {
  public readonly acl = new MonitoringPaiementsAntiCorruptionLayer();
  private readonly evenements: MonitoringPaiementsEvenement[] = [];

  public async synchroniserEvenement(evenement: MonitoringPaiementsEvenement): Promise<void> {
    this.evenements.push(evenement);
  }

  public snapshot(): readonly { readonly type: string; readonly cible: string }[] {
    return this.evenements.map((evenement) => this.acl.traduire(evenement));
  }
}
