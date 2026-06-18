import { NotificationsBulletinsIntegrationOrchestrator } from '../orchestration/NotificationsBulletinsIntegrationOrchestrator';
import type { NotificationBulletinsIntegrationRequest } from '../NotificationsBulletinsIntegrationTypes';

// Ce fichier expose les points d'entree d'ecoute du pont bulletins-evaluations vers Notifications.

/** Cette classe traduit les signaux du BC pedagogique en appels a l'orchestrateur Notifications. */
export class NotificationBulletinsEventListener {
  /** Ce constructeur relie le listener au pont d'integration bulletins-evaluations. */
  constructor(
    private readonly orchestrateurNotificationsBulletinsIntegration: NotificationsBulletinsIntegrationOrchestrator,
  ) {}

  /** Cette methode ecoute un evenement pedagogique et produit une intention Notifications. */
  public async ecouterEvenement(
    requete: NotificationBulletinsIntegrationRequest,
  ): Promise<void> {
    await this.orchestrateurNotificationsBulletinsIntegration.traiterEvenement(requete);
  }
}
