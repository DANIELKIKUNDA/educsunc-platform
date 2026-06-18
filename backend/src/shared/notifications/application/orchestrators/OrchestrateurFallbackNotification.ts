import { Notification } from '../../domain';
import { PortAuditNotification, PortMonitoringNotification } from '../ports';
import { ServiceApplicationNotifications } from '../services';

// Ce fichier orchestre le workflow de fallback de canal.

/** Cette classe coordonne l'activation d'un fallback sans connaitre les providers. */
export class OrchestrateurFallbackNotification {
  /** Ce constructeur assemble les dependances utiles au fallback. */
  constructor(
    private readonly serviceApplicationNotifications: ServiceApplicationNotifications,
    private readonly portAuditNotification: PortAuditNotification,
    private readonly portMonitoringNotification: PortMonitoringNotification,
  ) {}

  /** Cette methode ouvre un fallback de canal sur une notification. */
  public async executer(identifiantNotification: string, raison: string): Promise<Notification> {
    const notification = await this.serviceApplicationNotifications.chargerNotificationExigee(
      identifiantNotification,
    );
    notification.demarrerFallback();
    await this.serviceApplicationNotifications.sauvegarderEtPublier(notification);
    await this.portAuditNotification.enregistrer('notification.fallback', {
      notificationId: identifiantNotification,
      raison,
    });
    await this.portMonitoringNotification.enregistrerSignal('notifications.fallback', {
      notificationId: identifiantNotification,
    });
    return notification;
  }
}
