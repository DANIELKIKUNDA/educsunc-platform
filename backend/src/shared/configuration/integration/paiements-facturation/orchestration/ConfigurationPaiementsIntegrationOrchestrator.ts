import type { ConfigurationPaiementsEvenement, ConfigurationPaiementsSnapshot } from '../ConfigurationPaiementsIntegrationTypes';
import { ConfigurationPaiementsAntiCorruptionLayer } from '../acl/ConfigurationPaiementsAntiCorruptionLayer';
import { ConfigurationPaiementsEventListener } from '../listeners/ConfigurationPaiementsEventListener';

export class ConfigurationPaiementsIntegrationOrchestrator {
  public readonly acl = new ConfigurationPaiementsAntiCorruptionLayer();
  public readonly listener = new ConfigurationPaiementsEventListener();

  public async consommer(payload: Readonly<Record<string, unknown>>): Promise<void> {
    await this.listener.consommer(this.acl.normaliser(payload));
  }

  public async consommerEvenement(evenement: ConfigurationPaiementsEvenement): Promise<void> {
    await this.listener.consommer(evenement);
  }

  public snapshot(): ConfigurationPaiementsSnapshot {
    const projections = this.listener.lectures().lister();
    return {
      totalEvenements: projections.length,
      projections,
    };
  }
}
