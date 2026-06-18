import { CommandeExpirerNotification } from '../commands';
import { Notification } from '../../domain';
import { PortAuditNotification, PortMonitoringNotification } from '../ports';
import { ServiceApplicationNotifications } from '../services';

// Ce fichier orchestre le workflow d'expiration de notification.

/** Cette classe coordonne une expiration applicative de notification. */
export class OrchestrateurExpirationNotification {
  /** Ce constructeur assemble les dependances utiles a l'expiration. */
  constructor(
    private readonly serviceApplicationNotifications: ServiceApplicationNotifications,
    private readonly portAuditNotification: PortAuditNotification,
    private readonly portMonitoringNotification: PortMonitoringNotification,
  ) {}

  /** Cette methode orchestre l'expiration applicative d'une notification. */
  public async executer(commande: CommandeExpirerNotification): Promise<Notification> {
    const notification = await this.serviceApplicationNotifications.chargerNotificationExigee(
      commande.identifiantNotification,
    );
    notification.expirer();
    await this.serviceApplicationNotifications.sauvegarderEtPublier(notification);
    await this.portAuditNotification.enregistrer('notification.expiration', {
      notificationId: commande.identifiantNotification,
      raison: commande.raison,
    });
    await this.portMonitoringNotification.enregistrerSignal('notifications.expired', {
      notificationId: commande.identifiantNotification,
    });
    return notification;
  }
}
