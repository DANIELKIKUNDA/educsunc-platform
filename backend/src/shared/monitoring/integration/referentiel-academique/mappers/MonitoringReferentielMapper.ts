import type { MonitoringReferentielEvenement } from '../MonitoringReferentielIntegrationTypes';

// Ce fichier declare le mapper Referentiel vers Monitoring.

export class MonitoringReferentielMapper {
  public static versSignal(evenement: MonitoringReferentielEvenement): {
    readonly type: string;
    readonly composant: string;
  } {
    return {
      type: evenement.type,
      composant: evenement.composant,
    };
  }
}
