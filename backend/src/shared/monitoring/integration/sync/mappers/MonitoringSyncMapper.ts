import type { MonitoringSyncEvenement } from '../MonitoringSyncIntegrationTypes';

// Ce fichier declare le mapper Sync vers Monitoring.

export class MonitoringSyncMapper {
  public static versProjection(evenement: MonitoringSyncEvenement): {
    readonly type: string;
    readonly resourceId: string;
    readonly score: number;
  } {
    return {
      type: evenement.type,
      resourceId: evenement.resourceId,
      score: evenement.statut === 'FAILED' ? 100 : evenement.statut === 'STARTED' ? 50 : 10,
    };
  }
}
