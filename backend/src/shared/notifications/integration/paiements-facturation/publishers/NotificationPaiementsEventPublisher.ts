import type { NotificationPaiementsIntent } from '../NotificationsPaiementsIntegrationTypes';

// Ce fichier heberge le publisher memoire du pont entre paiements-facturation et Notifications.

/** Cette classe conserve un historique local des intentions publiees depuis le BC financier. */
export class NotificationPaiementsEventPublisher {
  private readonly intentions: NotificationPaiementsIntent[] = [];

  /** Ce constructeur fixe une retention memoire simple pour les intentions publiees. */
  constructor(private readonly retentionMaximale = 200) {}

  /** Cette methode memorise une intention issue du BC financier. */
  public publier(intention: NotificationPaiementsIntent): NotificationPaiementsIntent {
    this.intentions.push(intention);

    if (this.intentions.length > this.retentionMaximale) {
      this.intentions.splice(0, this.intentions.length - this.retentionMaximale);
    }

    return intention;
  }

  /** Cette methode retourne les intentions les plus recentes. */
  public listerRecentes(limite = 100): NotificationPaiementsIntent[] {
    return this.intentions.slice(-limite);
  }
}
