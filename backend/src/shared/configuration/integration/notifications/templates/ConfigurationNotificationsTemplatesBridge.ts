import type { ConfigurationNotificationEvenement } from '../ConfigurationNotificationsIntegrationTypes';

// Ce fichier declare le bridge de templates Notifications.

export class ConfigurationNotificationsTemplatesBridge {
  public rendre(evenement: ConfigurationNotificationEvenement): string {
    return `[${evenement.audience}] ${evenement.message}`;
  }
}
