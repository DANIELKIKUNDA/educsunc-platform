import type { ConfigurationPaiementsEvenement } from '../ConfigurationPaiementsIntegrationTypes';
import { ConfigurationPaiementsMapper } from '../mappers/ConfigurationPaiementsMapper';
import { ConfigurationPaiementsReadBridge } from '../read-models/ConfigurationPaiementsReadBridge';

export class ConfigurationPaiementsEventListener {
  constructor(private readonly readBridge = new ConfigurationPaiementsReadBridge()) {}

  public async consommer(evenement: ConfigurationPaiementsEvenement): Promise<void> {
    this.readBridge.enregistrer(ConfigurationPaiementsMapper.versProjection(evenement));
  }

  public lectures(): ConfigurationPaiementsReadBridge {
    return this.readBridge;
  }
}
