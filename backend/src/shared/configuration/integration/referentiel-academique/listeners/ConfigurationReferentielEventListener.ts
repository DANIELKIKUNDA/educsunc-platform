import type { ConfigurationReferentielEvenement } from '../ConfigurationReferentielIntegrationTypes';
import { ConfigurationReferentielMapper } from '../mappers/ConfigurationReferentielMapper';
import { ConfigurationReferentielReadBridge } from '../read-models/ConfigurationReferentielReadBridge';

export class ConfigurationReferentielEventListener {
  constructor(private readonly readBridge = new ConfigurationReferentielReadBridge()) {}

  public async consommer(evenement: ConfigurationReferentielEvenement): Promise<void> {
    this.readBridge.enregistrer(ConfigurationReferentielMapper.versProjection(evenement));
  }

  public lectures(): ConfigurationReferentielReadBridge {
    return this.readBridge;
  }
}
