import type { ConfigurationContext } from '../../../context';
import { ConfigurationMonitoringMapper } from '../mappers/ConfigurationMonitoringMapper';

// Ce fichier declare le bridge runtime vers Monitoring.

export class ConfigurationRuntimeMonitoringBridge {
  public projeterReload(configurationId: string, contexte: ConfigurationContext) {
    return ConfigurationMonitoringMapper.creerObservation(
      'RELOAD',
      'INFO',
      `Reload runtime observe pour ${configurationId}.`,
      contexte,
    );
  }
}
