import type { ConfigurationBulletinsEvenement, ConfigurationBulletinsSnapshot } from '../ConfigurationBulletinsIntegrationTypes';
import { ConfigurationBulletinsAntiCorruptionLayer } from '../acl/ConfigurationBulletinsAntiCorruptionLayer';
import { ConfigurationBulletinsEventListener } from '../listeners/ConfigurationBulletinsEventListener';

export class ConfigurationBulletinsIntegrationOrchestrator {
  public readonly acl = new ConfigurationBulletinsAntiCorruptionLayer();
  public readonly listener = new ConfigurationBulletinsEventListener();

  public async consommer(payload: Readonly<Record<string, unknown>>): Promise<void> {
    await this.listener.consommer(this.acl.normaliser(payload));
  }

  public async consommerEvenement(evenement: ConfigurationBulletinsEvenement): Promise<void> {
    await this.listener.consommer(evenement);
  }

  public snapshot(): ConfigurationBulletinsSnapshot {
    const projections = this.listener.lectures().lister();
    return {
      totalEvenements: projections.length,
      projections,
    };
  }
}
