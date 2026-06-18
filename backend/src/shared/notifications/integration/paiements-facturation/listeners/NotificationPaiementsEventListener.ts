import { NotificationsPaiementsIntegrationOrchestrator } from '../orchestration/NotificationsPaiementsIntegrationOrchestrator';
import type {
  NotificationPaiementsIntegrationRequest,
  NotificationPaiementsLegacyRequest,
} from '../NotificationsPaiementsIntegrationTypes';

// Ce fichier expose les points d'entree d'ecoute du pont paiements-facturation vers Notifications.

/** Cette classe traduit les signaux du BC financier en appels a l'orchestrateur Notifications. */
export class NotificationPaiementsEventListener {
  /** Ce constructeur relie le listener au pont d'integration paiements-facturation. */
  constructor(
    private readonly orchestrateurNotificationsPaiementsIntegration: NotificationsPaiementsIntegrationOrchestrator,
  ) {}

  /** Cette methode ecoute un evenement metier financier et produit une intention Notifications. */
  public async ecouterEvenement(
    requete: NotificationPaiementsIntegrationRequest,
  ): Promise<void> {
    await this.orchestrateurNotificationsPaiementsIntegration.traiterEvenement(requete);
  }

  /** Cette methode ecoute une demande legacy issue du port NotificationPort financier. */
  public async ecouterNotificationLegacy(
    requete: NotificationPaiementsLegacyRequest,
  ): Promise<void> {
    await this.orchestrateurNotificationsPaiementsIntegration.traiterDemandeLegacy(requete);
  }
}
