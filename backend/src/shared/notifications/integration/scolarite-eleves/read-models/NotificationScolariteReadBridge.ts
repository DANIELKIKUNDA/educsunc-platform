import type { NotificationScolariteIntent, NotificationScolariteIntegrationSnapshot } from '../NotificationsScolariteIntegrationTypes';

// Ce fichier expose une lecture consolidee du pont scolarite-eleves vers Notifications.

/** Cette classe calcule un snapshot lisible des intentions produites depuis le BC scolarite-eleves. */
export class NotificationScolariteReadBridge {
  /** Cette methode consolide les intentions publiees en vue d'administration et de diagnostic. */
  public construireSnapshot(
    intentions: readonly NotificationScolariteIntent[],
    totalDemandesLegacy: number,
  ): NotificationScolariteIntegrationSnapshot {
    const totalParEvenement: Record<string, number> = {};
    const totalParTypeNotification: Record<string, number> = {};

    for (const intention of intentions) {
      totalParEvenement[intention.typeEvenementScolarite] =
        (totalParEvenement[intention.typeEvenementScolarite] ?? 0) + 1;
      totalParTypeNotification[intention.intention.type] =
        (totalParTypeNotification[intention.intention.type] ?? 0) + 1;
    }

    return {
      totalIntentions: intentions.length,
      totalDemandesLegacy,
      totalParEvenement,
      totalParTypeNotification,
    };
  }
}
