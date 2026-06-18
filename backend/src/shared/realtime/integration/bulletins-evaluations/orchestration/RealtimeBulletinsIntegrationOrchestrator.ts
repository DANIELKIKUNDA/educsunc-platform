import { RealtimeNotificationsIntegrationOrchestrator } from '../../notifications';
import { RealtimeBulletinsAntiCorruptionLayer } from '../acl/RealtimeBulletinsAntiCorruptionLayer';
import { RealtimeBulletinsMapper } from '../mappers/RealtimeBulletinsMapper';
import type { RealtimeBulletinsEvenement } from '../RealtimeBulletinsIntegrationTypes';

export class RealtimeBulletinsIntegrationOrchestrator {
  private readonly acl = new RealtimeBulletinsAntiCorruptionLayer();
  private readonly notifications = new RealtimeNotificationsIntegrationOrchestrator();

  public async publier(evenement: RealtimeBulletinsEvenement): Promise<void> {
    const traduit = this.acl.traduire(evenement);
    await this.notifications.publier(RealtimeBulletinsMapper.mapper(traduit));
  }

  public snapshot() {
    return this.notifications.snapshot();
  }
}
