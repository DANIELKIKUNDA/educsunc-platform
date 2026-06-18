import { NotificationsScolariteIntegrationOrchestrator } from '../orchestration/NotificationsScolariteIntegrationOrchestrator';
import type {
  NotificationScolariteCommunicationRequest,
  NotificationScolariteIntegrationRequest,
} from '../NotificationsScolariteIntegrationTypes';

// Ce fichier expose les points d'entree d'ecoute du pont scolarite-eleves vers Notifications.

/** Cette classe traduit les signaux du BC scolarite-eleves en appels a l'orchestrateur Notifications. */
export class NotificationScolariteEventListener {
  /** Ce constructeur relie le listener au pont d'integration scolarite-eleves. */
  constructor(
    private readonly orchestrateurNotificationsScolariteIntegration: NotificationsScolariteIntegrationOrchestrator,
  ) {}

  /** Cette methode ecoute un evenement metier de scolarite et produit une intention Notifications. */
  public async ecouterEvenement(
    requete: NotificationScolariteIntegrationRequest,
  ): Promise<void> {
    await this.orchestrateurNotificationsScolariteIntegration.traiterEvenement(requete);
  }

  /** Cette methode ecoute une demande legacy de communication issue de la saga de scolarite. */
  public async ecouterDemandeCommunication(
    requete: NotificationScolariteCommunicationRequest,
  ): Promise<void> {
    await this.orchestrateurNotificationsScolariteIntegration.traiterDemandeCommunication(requete);
  }
}
