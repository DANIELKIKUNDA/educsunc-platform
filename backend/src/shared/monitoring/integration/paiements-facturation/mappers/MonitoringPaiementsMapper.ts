import type { MonitoringPaiementsEvenement } from '../MonitoringPaiementsIntegrationTypes';

// Ce fichier declare le mapper Paiements vers Monitoring.

export class MonitoringPaiementsMapper {
  public static versProjection(evenement: MonitoringPaiementsEvenement): {
    readonly type: string;
    readonly cible: string;
  } {
    return {
      type: evenement.type,
      cible: evenement.factureId ?? 'paiements-global',
    };
  }
}
