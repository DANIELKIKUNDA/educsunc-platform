import type { NotificationPaiementsIntent, NotificationPaiementsIntegrationSnapshot } from '../NotificationsPaiementsIntegrationTypes';

// Ce fichier expose une lecture consolidee du pont paiements-facturation vers Notifications.

/** Cette classe calcule un snapshot lisible des intentions produites depuis le BC financier. */
export class NotificationPaiementsReadBridge {
  /** Cette methode consolide les intentions publiees en vue d'administration et de diagnostic. */
  public construireSnapshot(
    intentions: readonly NotificationPaiementsIntent[],
    totalDemandesLegacy: number,
  ): NotificationPaiementsIntegrationSnapshot {
    const totalParEvenement: Record<string, number> = {};
    const totalParTypeNotification: Record<string, number> = {};

    for (const intention of intentions) {
      totalParEvenement[intention.typeEvenementPaiement] =
        (totalParEvenement[intention.typeEvenementPaiement] ?? 0) + 1;
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
