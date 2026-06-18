import { CommandeMettreEnFileNotification } from '../commands';
import { PortAuditNotification, PortFileDispatchNotification, PortMonitoringNotification } from '../ports';

// Ce fichier orchestre la mise en file explicite d'une notification.

/** Cette classe coordonne la diffusion asynchrone sans porter de logique provider. */
export class OrchestrateurDiffusionNotification {
  /** Ce constructeur relie l'orchestrateur aux ports de file, d'audit et de monitoring. */
  constructor(
    private readonly portFileDispatchNotification: PortFileDispatchNotification,
    private readonly portAuditNotification: PortAuditNotification,
    private readonly portMonitoringNotification: PortMonitoringNotification,
  ) {}

  /** Cette methode met une notification en file pour diffusion. */
  public async executer(commande: CommandeMettreEnFileNotification): Promise<void> {
    await this.portFileDispatchNotification.ajouter(commande.identifiantNotification, {
      correlationId: commande.correlationId,
      requestId: commande.requestId,
      prioriteJob: commande.prioriteJob,
    });
    await this.portAuditNotification.enregistrer('notification.queue.dispatch', {
      notificationId: commande.identifiantNotification,
    });
    await this.portMonitoringNotification.enregistrerSignal('notifications.queued', {
      notificationId: commande.identifiantNotification,
    });
  }
}
