import type { ConfigurationContext } from '../../../context';
import { ConfigurationRuntimeMapper } from '../mappers/ConfigurationRuntimeMapper';

// Ce fichier declare le bridge cache vers Runtime.

export class ConfigurationRuntimeCacheBridge {
  public construireInvalidation(configurationId: string, contexte: ConfigurationContext) {
    return ConfigurationRuntimeMapper.creerSignal(
      'CACHE_INVALIDATION',
      { ...contexte, configurationId },
      false,
    );
  }
}
