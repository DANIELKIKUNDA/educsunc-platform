import type { ConfigurationNotificationMessage } from '../ConfigurationNotificationsIntegrationTypes';

// Ce fichier declare le publisher vers Notifications.

export class ConfigurationNotificationsPublisher {
  private readonly messages: ConfigurationNotificationMessage[] = [];

  public async publier(message: ConfigurationNotificationMessage): Promise<void> {
    this.messages.push(message);
  }

  public journal(): readonly ConfigurationNotificationMessage[] {
    return [...this.messages];
  }
}
