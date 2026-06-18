import { MonitoringBulletinsAntiCorruptionLayer } from '../acl/MonitoringBulletinsAntiCorruptionLayer';
import type { MonitoringBulletinsEvenement } from '../MonitoringBulletinsIntegrationTypes';

// Ce fichier orchestre le pont Bulletins vers Monitoring.

export class MonitoringBulletinsIntegrationOrchestrator {
  public readonly acl = new MonitoringBulletinsAntiCorruptionLayer();
  private readonly evenements: MonitoringBulletinsEvenement[] = [];

  public async synchroniserEvenement(evenement: MonitoringBulletinsEvenement): Promise<void> {
    this.evenements.push(evenement);
  }

  public snapshot(): readonly { readonly type: string; readonly cible: string }[] {
    return this.evenements.map((evenement) => this.acl.traduire(evenement));
  }
}
