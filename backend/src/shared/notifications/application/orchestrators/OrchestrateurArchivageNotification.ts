import { CommandeArchiverNotification } from '../commands';
import { Notification } from '../../domain';
import { PortAuditNotification, PortMonitoringNotification } from '../ports';
import { ServiceApplicationNotifications } from '../services';

// Ce fichier orchestre le workflow d'archivage de notification.

/** Cette classe coordonne l'archivage applicatif d'une notification. */
export class OrchestrateurArchivageNotification {
  /** Ce constructeur assemble les dependances utiles a l'archivage. */
  constructor(
    private readonly serviceApplicationNotifications: ServiceApplicationNotifications,
    private readonly portAuditNotification: PortAuditNotification,
    private readonly portMonitoringNotification: PortMonitoringNotification,
  ) {}

  /** Cette methode orchestre l'archivage applicatif d'une notification. */
  public async executer(commande: CommandeArchiverNotification): Promise<Notification> {
    const notification = await this.serviceApplicationNotifications.chargerNotificationExigee(
      commande.identifiantNotification,
    );
    notification.archiver();
    await this.serviceApplicationNotifications.sauvegarderEtPublier(notification);
    await this.portAuditNotification.enregistrer('notification.archivage', {
      notificationId: commande.identifiantNotification,
      raison: commande.raison,
    });
    await this.portMonitoringNotification.enregistrerSignal('notifications.archived', {
      notificationId: commande.identifiantNotification,
    });
    return notification;
  }
}
