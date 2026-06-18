import type { RealtimeNotificationsSnapshot, RealtimeNotificationEvenement } from '../RealtimeNotificationsIntegrationTypes';
import { RealtimeNotificationsMapper } from '../mappers/RealtimeNotificationsMapper';
import { RealtimeNotificationsPublisher } from '../publishers/RealtimeNotificationsPublisher';

export class RealtimeNotificationsIntegrationOrchestrator {
  public readonly publisher = new RealtimeNotificationsPublisher();

  public async publier(evenement: RealtimeNotificationEvenement): Promise<void> {
    await this.publisher.publier(RealtimeNotificationsMapper.versCommande(evenement));
  }

  public snapshot(): RealtimeNotificationsSnapshot {
    const messages = this.publisher.journal();
    return {
      totalMessages: messages.length,
      messages,
    };
  }
}
