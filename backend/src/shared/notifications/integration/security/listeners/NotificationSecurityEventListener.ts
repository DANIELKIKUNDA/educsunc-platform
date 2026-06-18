import type { NotificationSecurityEvent } from '../NotificationsSecurityIntegrationTypes';
import { NotificationsSecurityIntegrationOrchestrator } from '../orchestration/NotificationsSecurityIntegrationOrchestrator';

// Ce fichier expose les points d'entree d'ecoute du pont Security vers Notifications.

/** Cette classe traduit les evenements du module Security en appels vers l'orchestrateur d'integration. */
export class NotificationSecurityEventListener {
  /** Ce constructeur relie le listener au pont d'integration Security. */
  constructor(
    private readonly orchestrateurNotificationsSecurityIntegration: NotificationsSecurityIntegrationOrchestrator,
  ) {}

  /** Cette methode ecoute un evenement Security et l'enregistre dans le pont Notifications. */
  public async ecouter(evenement: NotificationSecurityEvent): Promise<void> {
    await this.orchestrateurNotificationsSecurityIntegration.enregistrerEvenement(evenement);
  }
}
