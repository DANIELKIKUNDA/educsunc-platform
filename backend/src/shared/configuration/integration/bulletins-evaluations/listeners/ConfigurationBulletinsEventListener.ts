import type { ConfigurationBulletinsEvenement } from '../ConfigurationBulletinsIntegrationTypes';
import { ConfigurationBulletinsMapper } from '../mappers/ConfigurationBulletinsMapper';
import { ConfigurationBulletinsReadBridge } from '../read-models/ConfigurationBulletinsReadBridge';

export class ConfigurationBulletinsEventListener {
  constructor(private readonly readBridge = new ConfigurationBulletinsReadBridge()) {}

  public async consommer(evenement: ConfigurationBulletinsEvenement): Promise<void> {
    this.readBridge.enregistrer(ConfigurationBulletinsMapper.versProjection(evenement));
  }

  public lectures(): ConfigurationBulletinsReadBridge {
    return this.readBridge;
  }
}
