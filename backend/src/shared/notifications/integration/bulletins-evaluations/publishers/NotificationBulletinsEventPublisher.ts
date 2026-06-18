import type { NotificationBulletinsIntent } from '../NotificationsBulletinsIntegrationTypes';

// Ce fichier heberge le publisher memoire du pont entre bulletins-evaluations et Notifications.

/** Cette classe conserve un historique local des intentions publiees depuis le BC pedagogique. */
export class NotificationBulletinsEventPublisher {
  private readonly intentions: NotificationBulletinsIntent[] = [];

  /** Ce constructeur fixe une retention memoire simple pour les intentions publiees. */
  constructor(private readonly retentionMaximale = 200) {}

  /** Cette methode memorise une intention issue du BC pedagogique. */
  public publier(intention: NotificationBulletinsIntent): NotificationBulletinsIntent {
    this.intentions.push(intention);

    if (this.intentions.length > this.retentionMaximale) {
      this.intentions.splice(0, this.intentions.length - this.retentionMaximale);
    }

    return intention;
  }

  /** Cette methode retourne les intentions les plus recentes. */
  public listerRecentes(limite = 100): NotificationBulletinsIntent[] {
    return this.intentions.slice(-limite);
  }
}
