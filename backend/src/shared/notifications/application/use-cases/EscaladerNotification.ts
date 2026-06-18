import { DtoDetailsNotification } from '../dto';
import { CommandeEscaladerNotification } from '../commands';
import { MappeurNotificationVersDto } from '../mappers';
import { OrchestrateurEscaladeNotification } from '../orchestrators';
import { PortEscaladeNotification } from '../ports';

// Ce fichier declare le cas d'usage applicatif d'escalade de notification.

/** Cette classe expose le point d'entree applicatif d'escalade. */
export class EscaladerNotification implements PortEscaladeNotification {
  /** Ce constructeur relie le cas d'usage a l'orchestrateur d'escalade. */
  constructor(private readonly orchestrateurEscaladeNotification: OrchestrateurEscaladeNotification) {}

  /** Cette methode orchestre une escalation et retourne le DTO detail courant. */
  public async executer(commande: CommandeEscaladerNotification): Promise<DtoDetailsNotification> {
    const notification = await this.orchestrateurEscaladeNotification.executer(commande);
    return MappeurNotificationVersDto.depuisAgregat(notification);
  }
}
