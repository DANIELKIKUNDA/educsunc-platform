import type { NotificationBulletinsIntent, NotificationBulletinsIntegrationSnapshot } from '../NotificationsBulletinsIntegrationTypes';

// Ce fichier expose une lecture consolidee du pont bulletins-evaluations vers Notifications.

/** Cette classe calcule un snapshot lisible des intentions produites depuis le BC pedagogique. */
export class NotificationBulletinsReadBridge {
  /** Cette methode consolide les intentions publiees en vue d'administration et de diagnostic. */
  public construireSnapshot(
    intentions: readonly NotificationBulletinsIntent[],
  ): NotificationBulletinsIntegrationSnapshot {
    const totalParEvenement: Record<string, number> = {};
    const totalParTypeNotification: Record<string, number> = {};

    for (const intention of intentions) {
      totalParEvenement[intention.typeEvenementBulletins] =
        (totalParEvenement[intention.typeEvenementBulletins] ?? 0) + 1;
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
