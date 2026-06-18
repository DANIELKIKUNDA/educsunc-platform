import { RealtimeNotificationsIntegrationOrchestrator } from '../../notifications';
import { RealtimeScolariteAntiCorruptionLayer } from '../acl/RealtimeScolariteAntiCorruptionLayer';
import { RealtimeScolariteMapper } from '../mappers/RealtimeScolariteMapper';
import type { RealtimeScolariteEvenement } from '../RealtimeScolariteIntegrationTypes';

export class RealtimeScolariteIntegrationOrchestrator {
  private readonly acl = new RealtimeScolariteAntiCorruptionLayer();
  private readonly notifications = new RealtimeNotificationsIntegrationOrchestrator();

  public async publier(evenement: RealtimeScolariteEvenement): Promise<void> {
    const traduit = this.acl.traduire(evenement);
    await this.notifications.publier(RealtimeScolariteMapper.mapper(traduit));
  }

  public snapshot() {
    return this.notifications.snapshot();
  }
}
