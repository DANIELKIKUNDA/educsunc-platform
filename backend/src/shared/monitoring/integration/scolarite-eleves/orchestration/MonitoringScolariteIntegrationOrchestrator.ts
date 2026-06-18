import { MonitoringScolariteAntiCorruptionLayer } from '../acl/MonitoringScolariteAntiCorruptionLayer';
import type { MonitoringScolariteEvenement } from '../MonitoringScolariteIntegrationTypes';

// Ce fichier orchestre le pont Scolarite vers Monitoring.

export class MonitoringScolariteIntegrationOrchestrator {
  public readonly acl = new MonitoringScolariteAntiCorruptionLayer();
  private readonly evenements: MonitoringScolariteEvenement[] = [];

  public async synchroniserEvenement(evenement: MonitoringScolariteEvenement): Promise<void> {
    this.evenements.push(evenement);
  }

  public snapshot(): readonly { readonly type: string; readonly cible: string }[] {
    return this.evenements.map((evenement) => this.acl.traduire(evenement));
  }
}
