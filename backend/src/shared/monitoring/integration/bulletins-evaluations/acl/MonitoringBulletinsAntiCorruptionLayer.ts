import { MonitoringBulletinsMapper } from '../mappers/MonitoringBulletinsMapper';
import type { MonitoringBulletinsEvenement } from '../MonitoringBulletinsIntegrationTypes';

// Ce fichier declare la couche anti corruption Bulletins -> Monitoring.

export class MonitoringBulletinsAntiCorruptionLayer {
  public traduire(evenement: MonitoringBulletinsEvenement): {
    readonly type: string;
    readonly cible: string;
  } {
    return MonitoringBulletinsMapper.versProjection(evenement);
  }
}
