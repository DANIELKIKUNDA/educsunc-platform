import type { NotificationReferentielIntent } from '../NotificationsReferentielIntegrationTypes';

// Ce fichier heberge le publisher memoire du pont entre referentiel-academique et Notifications.

/** Cette classe conserve un historique local des intentions publiees depuis le BC de referentiel. */
export class NotificationReferentielEventPublisher {
  private readonly intentions: NotificationReferentielIntent[] = [];

  /** Ce constructeur fixe une retention memoire simple pour les intentions publiees. */
  constructor(private readonly retentionMaximale = 200) {}

  /** Cette methode memorise une intention issue du BC de referentiel. */
  public publier(intention: NotificationReferentielIntent): NotificationReferentielIntent {
    this.intentions.push(intention);

    if (this.intentions.length > this.retentionMaximale) {
      this.intentions.splice(0, this.intentions.length - this.retentionMaximale);
    }

    return intention;
  }

  /** Cette methode retourne les intentions les plus recentes. */
  public listerRecentes(limite = 100): NotificationReferentielIntent[] {
    return this.intentions.slice(-limite);
  }
}
