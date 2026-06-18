import type { MonitoringNotificationMessage } from '../MonitoringNotificationsIntegrationTypes';

// Ce fichier declare le publisher Notifications du module Monitoring.

export class MonitoringNotificationsPublisher {
  private readonly messages: MonitoringNotificationMessage[] = [];

  public async publier(message: MonitoringNotificationMessage): Promise<void> {
    this.messages.push(message);
  }

  public lister(): readonly MonitoringNotificationMessage[] {
    return [...this.messages];
  }
}
