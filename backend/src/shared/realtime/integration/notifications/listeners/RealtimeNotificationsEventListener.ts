import type { RealtimeNotificationEvenement } from '../RealtimeNotificationsIntegrationTypes';

export class RealtimeNotificationsEventListener {
  public consommer(evenement: RealtimeNotificationEvenement): RealtimeNotificationEvenement {
    return evenement;
  }
}
