import type { ConfigurationNotificationEvenement, ConfigurationNotificationMessage } from '../ConfigurationNotificationsIntegrationTypes';

// Ce fichier declare le mapper vers Notifications.

export class ConfigurationNotificationsEventMapper {
  public static versMessage(evenement: ConfigurationNotificationEvenement): ConfigurationNotificationMessage {
    return {
      canal: 'IN_APP',
      titre: `Configuration ${evenement.type}`,
      contenu: evenement.message,
      configurationId: evenement.contexte.configurationId,
    };
  }
}
