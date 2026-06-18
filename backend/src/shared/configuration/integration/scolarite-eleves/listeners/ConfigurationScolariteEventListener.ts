import type { ConfigurationScolariteEvenement } from '../ConfigurationScolariteIntegrationTypes';
import { ConfigurationScolariteMapper } from '../mappers/ConfigurationScolariteMapper';
import { ConfigurationScolariteReadBridge } from '../read-models/ConfigurationScolariteReadBridge';

export class ConfigurationScolariteEventListener {
  constructor(private readonly readBridge = new ConfigurationScolariteReadBridge()) {}

  public async consommer(evenement: ConfigurationScolariteEvenement): Promise<void> {
    this.readBridge.enregistrer(ConfigurationScolariteMapper.versProjection(evenement));
  }

  public lectures(): ConfigurationScolariteReadBridge {
    return this.readBridge;
  }
}
