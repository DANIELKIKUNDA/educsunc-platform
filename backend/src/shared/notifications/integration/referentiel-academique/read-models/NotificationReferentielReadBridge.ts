import type {
  NotificationReferentielIntent,
  NotificationReferentielIntegrationSnapshot,
} from '../NotificationsReferentielIntegrationTypes';

// Ce fichier expose une lecture consolidee du pont referentiel-academique vers Notifications.

/** Cette classe calcule un snapshot lisible des intentions produites depuis le BC de referentiel. */
export class NotificationReferentielReadBridge {
  /** Cette methode consolide les intentions publiees en vue d'administration et de diagnostic. */
  public construireSnapshot(
    intentions: readonly NotificationReferentielIntent[],
  ): NotificationReferentielIntegrationSnapshot {
    const totalParEvenement: Record<string, number> = {};
    const totalParTypeNotification: Record<string, number> = {};

    for (const intention of intentions) {
      totalParEvenement[intention.typeEvenementReferentiel] =
        (totalParEvenement[intention.typeEvenementReferentiel] ?? 0) + 1;
      totalParTypeNotification[intention.intention.type] =
        (totalParTypeNotification[intention.intention.type] ?? 0) + 1;
    }

    return {
      totalIntentions: intentions.length,
      totalParEvenement,
      totalParTypeNotification,
    };
  }
}
