import type {
  NotificationMonitoringIntegrationRecord,
  NotificationMonitoringObservation,
} from '../NotificationsMonitoringIntegrationTypes';
import { NotificationMonitoringEventMapper } from '../mappers/NotificationMonitoringEventMapper';

// Ce fichier heberge le publisher memoire du pont d'integration monitoring.

/** Cette classe conserve un historique local des observations remontees vers le monitoring transverse. */
export class NotificationMonitoringEventPublisher {
  private readonly enregistrements: NotificationMonitoringIntegrationRecord[] = [];

  /** Ce constructeur fixe la retention memoire du publisher de monitoring. */
  constructor(private readonly retentionMaximale = 250) {}

  /** Cette methode publie une observation et retourne l'enregistrement memorise. */
  public publier(
    observation: NotificationMonitoringObservation,
  ): NotificationMonitoringIntegrationRecord {
    const enregistrement = NotificationMonitoringEventMapper.versEnregistrement(observation);
    this.enregistrements.push(enregistrement);

    if (this.enregistrements.length > this.retentionMaximale) {
      this.enregistrements.splice(0, this.enregistrements.length - this.retentionMaximale);
    }

    return enregistrement;
  }

  /** Cette methode retourne une copie des enregistrements les plus recents. */
  public listerRecents(limite = 100): NotificationMonitoringIntegrationRecord[] {
    return this.enregistrements.slice(-limite);
  }
}
