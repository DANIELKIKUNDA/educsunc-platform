import { MonitoringNotificationsMapper } from '../mappers/MonitoringNotificationsMapper';
import { MonitoringNotificationsPublisher } from '../publishers/MonitoringNotificationsPublisher';
import type { MonitoringNotificationsEvenement } from '../MonitoringNotificationsIntegrationTypes';

// Ce fichier orchestre le pont Notifications vers Monitoring.

export class MonitoringNotificationsIntegrationOrchestrator {
  public readonly publisher = new MonitoringNotificationsPublisher();

  public async publierEvenement(evenement: MonitoringNotificationsEvenement): Promise<void> {
    await this.publisher.publier(MonitoringNotificationsMapper.versMessage(evenement));
  }
}
