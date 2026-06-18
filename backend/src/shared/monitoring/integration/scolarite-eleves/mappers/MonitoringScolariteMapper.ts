import type { MonitoringScolariteEvenement } from '../MonitoringScolariteIntegrationTypes';

// Ce fichier declare le mapper Scolarite vers Monitoring.

export class MonitoringScolariteMapper {
  public static versProjection(evenement: MonitoringScolariteEvenement): {
    readonly type: string;
    readonly cible: string;
  } {
    return {
      type: evenement.type,
      cible: evenement.eleveId ?? 'scolarite-global',
    };
  }
}
