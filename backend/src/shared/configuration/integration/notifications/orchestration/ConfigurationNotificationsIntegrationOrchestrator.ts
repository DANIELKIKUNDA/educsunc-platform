import type { ConfigurationNotificationEvenement, ConfigurationNotificationsSnapshot } from '../ConfigurationNotificationsIntegrationTypes';
import { ConfigurationNotificationsTemplatesBridge } from '../templates/ConfigurationNotificationsTemplatesBridge';
import { ConfigurationNotificationsEventMapper } from '../mappers/ConfigurationNotificationsEventMapper';
import { ConfigurationNotificationsPublisher } from '../publishers/ConfigurationNotificationsPublisher';

// Ce fichier orchestre le pont Notifications.

export class ConfigurationNotificationsIntegrationOrchestrator {
  public readonly templates = new ConfigurationNotificationsTemplatesBridge();
  public readonly publisher = new ConfigurationNotificationsPublisher();

  public async notifier(evenement: ConfigurationNotificationEvenement): Promise<void> {
    const message = ConfigurationNotificationsEventMapper.versMessage({
      ...evenement,
      message: this.templates.rendre(evenement),
    });
    await this.publisher.publier(message);
  }

  public snapshot(): ConfigurationNotificationsSnapshot {
    const messages = this.publisher.journal();
    return {
      totalMessages: messages.length,
      messages,
    };
  }
}
