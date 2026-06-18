import { DtoDetailsNotification } from '../dto';
import { CommandeRejouerNotification } from '../commands';
import { MappeurNotificationVersDto } from '../mappers';
import { OrchestrateurReplayNotification } from '../orchestrators';
import { PortReplayNotification } from '../ports';

// Ce fichier declare le cas d'usage applicatif de rejeu de notification.

/** Cette classe expose le point d'entree applicatif de rejeu. */
export class RejouerNotification implements PortReplayNotification {
  /** Ce constructeur relie le cas d'usage a l'orchestrateur de rejeu. */
  constructor(private readonly orchestrateurReplayNotification: OrchestrateurReplayNotification) {}

  /** Cette methode rejeu une notification et retourne son DTO detail. */
  public async executer(commande: CommandeRejouerNotification): Promise<DtoDetailsNotification> {
    const notification = await this.orchestrateurReplayNotification.executer(commande);
    return MappeurNotificationVersDto.depuisAgregat(notification);
  }
}
