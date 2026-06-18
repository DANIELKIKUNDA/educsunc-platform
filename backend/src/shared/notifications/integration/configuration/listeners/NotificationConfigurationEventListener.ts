import type { NotificationConfigurationChange } from '../NotificationsConfigurationIntegrationTypes';
import { NotificationsConfigurationIntegrationOrchestrator } from '../orchestration/NotificationsConfigurationIntegrationOrchestrator';

// Ce fichier expose les points d'entree d'ecoute du pont Configuration vers Notifications.

/** Cette classe traduit les changements Configuration en appels vers l'orchestrateur Notifications. */
export class NotificationConfigurationEventListener {
  /** Ce constructeur relie le listener au pont d'integration Configuration. */
  constructor(
    private readonly orchestrateurNotificationsConfigurationIntegration: NotificationsConfigurationIntegrationOrchestrator,
  ) {}

  /** Cette methode ecoute un changement de configuration et le synchronise dans Notifications. */
  public async ecouter(changement: NotificationConfigurationChange): Promise<void> {
    await this.orchestrateurNotificationsConfigurationIntegration.appliquerChangement(changement);
  }
}
