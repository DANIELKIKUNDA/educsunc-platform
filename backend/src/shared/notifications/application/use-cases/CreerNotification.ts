import { DtoDetailsNotification } from '../dto';
import { CommandeCreerNotification } from '../commands';
import { MappeurNotificationVersDto } from '../mappers';
import { OrchestrateurCreationNotification } from '../orchestrators';
import { PortCreationNotification } from '../ports';

// Ce fichier declare le cas d'usage applicatif de creation de notification.

/** Cette classe expose le point d'entree applicatif de creation de notification. */
export class CreerNotification implements PortCreationNotification {
  /** Ce constructeur relie le cas d'usage a l'orchestrateur de creation. */
  constructor(private readonly orchestrateurCreationNotification: OrchestrateurCreationNotification) {}

  /** Cette methode cree une notification et retourne son DTO detail. */
  public async executer(commande: CommandeCreerNotification): Promise<DtoDetailsNotification> {
    const notification = await this.orchestrateurCreationNotification.executer(commande);
    return MappeurNotificationVersDto.depuisAgregat(notification);
  }
}
