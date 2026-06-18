import type {
  NotificationAuthEvenementSession,
  NotificationAuthMiseAJourContexte,
  NotificationAuthMiseAJourPermissions,
} from '../NotificationsAuthIntegrationTypes';
import { NotificationsAuthIntegrationOrchestrator } from '../orchestration/NotificationsAuthIntegrationOrchestrator';

// Ce fichier expose les points d'entree d'ecoute du pont Auth vers Notifications.

/** Cette classe traduit les signaux emits par Auth en appels au pont d'integration Notifications. */
export class NotificationAuthEventListener {
  /** Ce constructeur relie le listener a l'orchestrateur d'integration Auth. */
  constructor(
    private readonly orchestrateurNotificationsAuthIntegration: NotificationsAuthIntegrationOrchestrator,
  ) {}

  /** Cette methode ecoute une mise a jour de session depuis Auth. */
  public async ecouterEvenementSession(
    evenement: NotificationAuthEvenementSession,
  ): Promise<void> {
    await this.orchestrateurNotificationsAuthIntegration.enregistrerEvenementSession(evenement);
  }

  /** Cette methode ecoute une mise a jour de contexte actif depuis Auth. */
  public async ecouterMiseAJourContexte(
    miseAJour: NotificationAuthMiseAJourContexte,
  ): Promise<void> {
    await this.orchestrateurNotificationsAuthIntegration.synchroniserContexteActif(miseAJour);
  }

  /** Cette methode ecoute une mise a jour de permissions depuis Auth. */
  public async ecouterMiseAJourPermissions(
    miseAJour: NotificationAuthMiseAJourPermissions,
  ): Promise<void> {
    await this.orchestrateurNotificationsAuthIntegration.synchroniserPermissions(miseAJour);
  }
}
