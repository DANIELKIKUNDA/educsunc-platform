import type { ConfigurationNotificationEvenement } from '../ConfigurationNotificationsIntegrationTypes';
import { ConfigurationNotificationsEventMapper } from '../mappers/ConfigurationNotificationsEventMapper';
import { ConfigurationNotificationsPublisher } from '../publishers/ConfigurationNotificationsPublisher';

// Ce fichier declare le listener Notifications.

export class ConfigurationNotificationsEventListener {
  constructor(private readonly publisher = new ConfigurationNotificationsPublisher()) {}

  public async consommer(evenement: ConfigurationNotificationEvenement): Promise<void> {
    await this.publisher.publier(ConfigurationNotificationsEventMapper.versMessage(evenement));
  }

  public sorties(): ConfigurationNotificationsPublisher {
    return this.publisher;
  }
}
