import type { ConfigurationContext } from '../../../context';
import type { ConfigurationRuntimeSnapshot } from '../ConfigurationRuntimeIntegrationTypes';
import { ConfigurationRuntimeCacheBridge } from '../cache/ConfigurationRuntimeCacheBridge';
import { ConfigurationRuntimeEventListener } from '../listeners/ConfigurationRuntimeEventListener';
import { ConfigurationRuntimeReloadBridge } from '../reload/ConfigurationRuntimeReloadBridge';

// Ce fichier orchestre le pont Runtime.

export class ConfigurationRuntimeIntegrationOrchestrator {
  public readonly listener = new ConfigurationRuntimeEventListener();
  public readonly reload = new ConfigurationRuntimeReloadBridge();
  public readonly cache = new ConfigurationRuntimeCacheBridge();

  public async recharger(configurationId: string, contexte: ConfigurationContext, force: boolean): Promise<void> {
    await this.listener.consommer(this.reload.construire(configurationId, contexte, force));
  }

  public async invaliderCache(configurationId: string, contexte: ConfigurationContext): Promise<void> {
    await this.listener.consommer(this.cache.construireInvalidation(configurationId, contexte));
  }

  public snapshot(): ConfigurationRuntimeSnapshot {
    const derniersSignals = this.listener.journal();
    return {
      totalSignals: derniersSignals.length,
      derniersSignals,
    };
  }
}
