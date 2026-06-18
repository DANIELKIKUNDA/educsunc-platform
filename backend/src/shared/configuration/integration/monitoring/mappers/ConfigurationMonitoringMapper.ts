import type { ConfigurationContext } from '../../../context';
import type { ConfigurationMonitoringObservation } from '../ConfigurationMonitoringIntegrationTypes';

// Ce fichier declare le mapper vers Monitoring.

export class ConfigurationMonitoringMapper {
  public static creerObservation(
    source: ConfigurationMonitoringObservation['source'],
    niveau: ConfigurationMonitoringObservation['niveau'],
    message: string,
    contexte: ConfigurationContext,
  ): ConfigurationMonitoringObservation {
    return {
      source,
      niveau,
      message,
      contexte,
      observeLe: new Date(),
    };
  }
}
