import { MonitoringScolariteMapper } from '../mappers/MonitoringScolariteMapper';
import type { MonitoringScolariteEvenement } from '../MonitoringScolariteIntegrationTypes';

// Ce fichier declare la couche anti corruption Scolarite -> Monitoring.

export class MonitoringScolariteAntiCorruptionLayer {
  public traduire(evenement: MonitoringScolariteEvenement): {
    readonly type: string;
    readonly cible: string;
  } {
    return MonitoringScolariteMapper.versProjection(evenement);
  }
}
