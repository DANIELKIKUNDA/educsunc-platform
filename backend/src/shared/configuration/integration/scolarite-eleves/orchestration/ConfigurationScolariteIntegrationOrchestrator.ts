import type { ConfigurationScolariteEvenement, ConfigurationScolariteSnapshot } from '../ConfigurationScolariteIntegrationTypes';
import { ConfigurationScolariteAntiCorruptionLayer } from '../acl/ConfigurationScolariteAntiCorruptionLayer';
import { ConfigurationScolariteEventListener } from '../listeners/ConfigurationScolariteEventListener';

export class ConfigurationScolariteIntegrationOrchestrator {
  public readonly acl = new ConfigurationScolariteAntiCorruptionLayer();
  public readonly listener = new ConfigurationScolariteEventListener();

  public async consommer(payload: Readonly<Record<string, unknown>>): Promise<void> {
    await this.listener.consommer(this.acl.normaliser(payload));
  }

  public async consommerEvenement(evenement: ConfigurationScolariteEvenement): Promise<void> {
    await this.listener.consommer(evenement);
  }

  public snapshot(): ConfigurationScolariteSnapshot {
    const projections = this.listener.lectures().lister();
    return {
      totalEvenements: projections.length,
      projections,
    };
  }
}
