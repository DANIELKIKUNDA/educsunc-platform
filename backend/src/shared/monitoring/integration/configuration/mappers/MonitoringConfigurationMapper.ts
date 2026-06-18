import type { MonitoringConfigurationEvenement, MonitoringConfigurationProjection } from '../MonitoringConfigurationIntegrationTypes';

// Ce fichier declare le mapper Configuration vers Monitoring.

export class MonitoringConfigurationMapper {
  public static appliquer(
    projection: MonitoringConfigurationProjection,
    evenement: MonitoringConfigurationEvenement,
  ): MonitoringConfigurationProjection {
    if (evenement.type === 'THRESHOLD_UPDATED' && typeof evenement.valeur === 'number') {
      return {
        ...projection,
        thresholds: {
          ...projection.thresholds,
          [evenement.cle]: evenement.valeur,
        },
      };
    }
    if (evenement.type === 'RETENTION_UPDATED' && typeof evenement.valeur === 'number') {
      return {
        ...projection,
        retentionDays: evenement.valeur,
      };
    }
    return {
      ...projection,
      runtime: {
        ...projection.runtime,
        [evenement.cle]: evenement.valeur,
      },
    };
  }
}
