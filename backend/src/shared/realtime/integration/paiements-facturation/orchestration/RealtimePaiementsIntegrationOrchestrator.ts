import { RealtimeNotificationsIntegrationOrchestrator } from '../../notifications';
import { RealtimePaiementsAntiCorruptionLayer } from '../acl/RealtimePaiementsAntiCorruptionLayer';
import { RealtimePaiementsMapper } from '../mappers/RealtimePaiementsMapper';
import type { RealtimePaiementsEvenement } from '../RealtimePaiementsIntegrationTypes';

export class RealtimePaiementsIntegrationOrchestrator {
  private readonly acl = new RealtimePaiementsAntiCorruptionLayer();
  private readonly notifications = new RealtimeNotificationsIntegrationOrchestrator();

  public async publier(evenement: RealtimePaiementsEvenement): Promise<void> {
    const traduit = this.acl.traduire(evenement);
    await this.notifications.publier(RealtimePaiementsMapper.mapper(traduit));
  }

  public snapshot() {
    return this.notifications.snapshot();
  }
}
