import { MonitoringPaiementsMapper } from '../mappers/MonitoringPaiementsMapper';
import type { MonitoringPaiementsEvenement } from '../MonitoringPaiementsIntegrationTypes';

// Ce fichier declare la couche anti corruption Paiements -> Monitoring.

export class MonitoringPaiementsAntiCorruptionLayer {
  public traduire(evenement: MonitoringPaiementsEvenement): {
    readonly type: string;
    readonly cible: string;
  } {
    return MonitoringPaiementsMapper.versProjection(evenement);
  }
}
