import { CommandeControlerRetryNotification } from '../commands';
import { Notification } from '../../domain';
import { PortAuditNotification, PortFileRetryNotification, PortMonitoringNotification } from '../ports';
import { ServiceApplicationNotifications } from '../services';
import { ValidateurCommandeRetryNotification } from '../validators';

// Ce fichier orchestre le workflow de retry d'une notification.

/** Cette classe coordonne la planification et le suivi applicatif des retries. */
export class OrchestrateurRetryNotification {
  /** Ce constructeur assemble les dependances utiles au retry. */
  constructor(
    private readonly serviceApplicationNotifications: ServiceApplicationNotifications,
    private readonly portFileRetryNotification: PortFileRetryNotification,
    private readonly portAuditNotification: PortAuditNotification,
    private readonly portMonitoringNotification: PortMonitoringNotification,
    private readonly validateurCommandeRetryNotification = new ValidateurCommandeRetryNotification(),
  ) {}

  /** Cette methode orchestre un workflow de retry. */
  public async executer(commande: CommandeControlerRetryNotification): Promise<Notification> {
    this.validateurCommandeRetryNotification.valider(commande);
    const notification = await this.serviceApplicationNotifications.chargerNotificationExigee(
      commande.identifiantNotification,
    );

    if (commande.action === 'PLANIFIER' || commande.action === 'FORCER') {
      notification.planifierRetry();
      notification.demarrerRetry();
      await this.portFileRetryNotification.ajouter(commande.identifiantNotification, {
        raison: commande.raison,
        action: commande.action,
      });
    }

    await this.serviceApplicationNotifications.sauvegarderEtPublier(notification);
    await this.portAuditNotification.enregistrer('notification.retry', {
      notificationId: commande.identifiantNotification,
      action: commande.action,
    });
    await this.portMonitoringNotification.enregistrerSignal('notifications.retry', {
      notificationId: commande.identifiantNotification,
    });

    return notification;
  }
}
