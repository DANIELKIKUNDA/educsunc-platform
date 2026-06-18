import type { ConfigurationContext } from '../../../context';
import { ConfigurationRuntimeMapper } from '../mappers/ConfigurationRuntimeMapper';

// Ce fichier declare le bridge reload vers Runtime.

export class ConfigurationRuntimeReloadBridge {
  public construire(configurationId: string, contexte: ConfigurationContext, force: boolean) {
    return ConfigurationRuntimeMapper.creerSignal(
      'RELOAD',
      { ...contexte, configurationId },
      force,
    );
  }
}
