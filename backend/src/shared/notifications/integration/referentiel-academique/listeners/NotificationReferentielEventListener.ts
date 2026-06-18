import { NotificationsReferentielIntegrationOrchestrator } from '../orchestration/NotificationsReferentielIntegrationOrchestrator';
import type { NotificationReferentielIntegrationRequest } from '../NotificationsReferentielIntegrationTypes';

// Ce fichier expose les points d'entree d'ecoute du pont referentiel-academique vers Notifications.

/** Cette classe traduit les signaux du BC de referentiel en appels a l'orchestrateur Notifications. */
export class NotificationReferentielEventListener {
  /** Ce constructeur relie le listener au pont d'integration referentiel-academique. */
  constructor(
    private readonly orchestrateurNotificationsReferentielIntegration: NotificationsReferentielIntegrationOrchestrator,
  ) {}

  /** Cette methode ecoute un evenement de referentiel et produit une intention Notifications. */
  public async ecouterEvenement(
    requete: NotificationReferentielIntegrationRequest,
  ): Promise<void> {
    await this.orchestrateurNotificationsReferentielIntegration.traiterEvenement(requete);
  }
}
