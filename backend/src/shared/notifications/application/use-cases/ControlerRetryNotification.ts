import { DtoDetailsNotification } from '../dto';
import { CommandeControlerRetryNotification } from '../commands';
import { MappeurNotificationVersDto } from '../mappers';
import { OrchestrateurRetryNotification } from '../orchestrators';

// Ce fichier declare le cas d'usage applicatif de controle de retry.

/** Cette classe expose le point d'entree applicatif de retry. */
export class ControlerRetryNotification {
  /** Ce constructeur relie le cas d'usage a l'orchestrateur de retry. */
  constructor(private readonly orchestrateurRetryNotification: OrchestrateurRetryNotification) {}

  /** Cette methode orchestre le retry et retourne le DTO detail courant. */
  public async executer(commande: CommandeControlerRetryNotification): Promise<DtoDetailsNotification> {
    const notification = await this.orchestrateurRetryNotification.executer(commande);
    return MappeurNotificationVersDto.depuisAgregat(notification);
  }
}
