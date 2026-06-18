import type { NotificationTempsReelEvent } from '../NotificationsTempsReelIntegrationTypes';
import { NotificationsTempsReelIntegrationOrchestrator } from '../orchestration/NotificationsTempsReelIntegrationOrchestrator';

// Ce fichier expose les points d'entree d'ecoute du pont temps reel Notifications.

/** Cette classe traduit les evenements d'integration temps reel en appels d'orchestration. */
export class NotificationTempsReelEventListener {
  /** Ce constructeur relie le listener a l'orchestrateur du pont temps reel. */
  constructor(
    private readonly orchestrateurNotificationsTempsReelIntegration: NotificationsTempsReelIntegrationOrchestrator,
  ) {}

  /** Cette methode ecoute un evenement temps reel futur et le synchronise dans le pont local. */
  public async ecouter(evenement: NotificationTempsReelEvent): Promise<void> {
    await this.orchestrateurNotificationsTempsReelIntegration.enregistrerEvenement(evenement);
  }
}
