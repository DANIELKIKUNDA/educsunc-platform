import { RealtimeNotificationsIntegrationOrchestrator } from '../../notifications';
import { RealtimeReferentielAntiCorruptionLayer } from '../acl/RealtimeReferentielAntiCorruptionLayer';
import { RealtimeReferentielMapper } from '../mappers/RealtimeReferentielMapper';
import type { RealtimeReferentielEvenement } from '../RealtimeReferentielIntegrationTypes';

export class RealtimeReferentielIntegrationOrchestrator {
  private readonly acl = new RealtimeReferentielAntiCorruptionLayer();
  private readonly notifications = new RealtimeNotificationsIntegrationOrchestrator();

  public async publier(evenement: RealtimeReferentielEvenement): Promise<void> {
    const traduit = this.acl.traduire(evenement);
    await this.notifications.publier(RealtimeReferentielMapper.mapper(traduit));
  }

  public snapshot() {
    return this.notifications.snapshot();
  }
}
