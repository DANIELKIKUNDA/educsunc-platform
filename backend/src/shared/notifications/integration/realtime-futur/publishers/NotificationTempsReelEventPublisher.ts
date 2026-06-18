import type { NotificationTempsReelIntegrationRecord, NotificationTempsReelIntegrationRequest } from '../NotificationsTempsReelIntegrationTypes';
import { NotificationTempsReelEventMapper } from '../mappers/NotificationTempsReelEventMapper';

// Ce fichier heberge le publisher memoire du pont temps reel Notifications.

/** Cette classe conserve un historique local des publications temps reel issues de Notifications. */
export class NotificationTempsReelEventPublisher {
  private readonly publications: NotificationTempsReelIntegrationRecord[] = [];

  /** Ce constructeur fixe une retention memoire simple des publications. */
  constructor(private readonly retentionMaximale = 200) {}

  /** Cette methode publie une demande logique dans l'historique local. */
  public publier(
    demande: NotificationTempsReelIntegrationRequest,
  ): NotificationTempsReelIntegrationRecord {
    const enregistrement = NotificationTempsReelEventMapper.versEnregistrement(demande);
    this.publications.push(enregistrement);

    if (this.publications.length > this.retentionMaximale) {
      this.publications.splice(0, this.publications.length - this.retentionMaximale);
    }

    return enregistrement;
  }

  /** Cette methode retourne les publications les plus recentes. */
  public listerRecentes(limite = 100): NotificationTempsReelIntegrationRecord[] {
    return this.publications.slice(-limite);
  }
}
