import type { ConfigurationReferentielEvenement, ConfigurationReferentielSnapshot } from '../ConfigurationReferentielIntegrationTypes';
import { ConfigurationReferentielAntiCorruptionLayer } from '../acl/ConfigurationReferentielAntiCorruptionLayer';
import { ConfigurationReferentielEventListener } from '../listeners/ConfigurationReferentielEventListener';

export class ConfigurationReferentielIntegrationOrchestrator {
  public readonly acl = new ConfigurationReferentielAntiCorruptionLayer();
  public readonly listener = new ConfigurationReferentielEventListener();

  public async consommer(payload: Readonly<Record<string, unknown>>): Promise<void> {
    await this.listener.consommer(this.acl.normaliser(payload));
  }

  public async consommerEvenement(evenement: ConfigurationReferentielEvenement): Promise<void> {
    await this.listener.consommer(evenement);
  }

  public snapshot(): ConfigurationReferentielSnapshot {
    const projections = this.listener.lectures().lister();
    return {
      totalEvenements: projections.length,
      projections,
    };
  }
}
