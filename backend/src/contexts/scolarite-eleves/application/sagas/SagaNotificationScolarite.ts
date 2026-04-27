import { CommunicationPort, NotificationScolarite } from '../ports/CommunicationPort';

// Ce fichier contient la saga de notification scolarite.
/**
 * Cette saga demande l'envoi de notifications sans mettre cette logique dans le domaine.
 */
export class SagaNotificationScolarite {
  constructor(private readonly communicationPort?: CommunicationPort) {}

  /** Demande l'envoi d'une notification de scolarite. */
  public async notifier(notification: NotificationScolarite): Promise<void> {
    await this.communicationPort?.demanderNotification(notification);
  }
}
