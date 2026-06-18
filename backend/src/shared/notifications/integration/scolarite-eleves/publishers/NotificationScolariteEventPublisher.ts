import type { NotificationScolariteIntent } from '../NotificationsScolariteIntegrationTypes';

// Ce fichier heberge le publisher memoire du pont entre scolarite-eleves et Notifications.

/** Cette classe conserve un historique local des intentions publiees depuis le BC scolarite-eleves. */
export class NotificationScolariteEventPublisher {
  private readonly intentions: NotificationScolariteIntent[] = [];

  /** Ce constructeur fixe une retention memoire simple pour les intentions publiees. */
  constructor(private readonly retentionMaximale = 200) {}

  /** Cette methode memorise une intention issue du BC scolarite-eleves. */
  public publier(intention: NotificationScolariteIntent): NotificationScolariteIntent {
    this.intentions.push(intention);

    if (this.intentions.length > this.retentionMaximale) {
      this.intentions.splice(0, this.intentions.length - this.retentionMaximale);
    }

    return intention;
  }

  /** Cette methode retourne les intentions les plus recentes. */
  public listerRecentes(limite = 100): NotificationScolariteIntent[] {
    return this.intentions.slice(-limite);
  }
}
