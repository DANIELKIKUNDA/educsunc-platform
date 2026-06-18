import type { MonitoringReferentielEvenement } from '../MonitoringReferentielIntegrationTypes';
import { MonitoringReferentielMapper } from '../mappers/MonitoringReferentielMapper';

// Ce fichier declare la couche anti corruption Referentiel -> Monitoring.

export class MonitoringReferentielAntiCorruptionLayer {
  public traduire(evenement: MonitoringReferentielEvenement): {
    readonly type: string;
    readonly composant: string;
  } {
    return MonitoringReferentielMapper.versSignal(evenement);
  }
}
