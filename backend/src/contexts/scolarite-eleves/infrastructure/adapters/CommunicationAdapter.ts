import { CommunicationPort, NotificationScolarite } from '../../application/ports/CommunicationPort';
import { ClientHttpScolarite } from './ClientHttpScolarite';

// Ce fichier implemente le port vers le service de communication.
export class CommunicationAdapter implements CommunicationPort {
  constructor(private readonly clientHttp: ClientHttpScolarite, private readonly urlBase: string) {}

  /** Demande l'envoi d'une notification. */
  public async demanderNotification(notification: NotificationScolarite): Promise<void> {
    await this.clientHttp.post(`${this.urlBase}/notifications`, notification);
  }
}
