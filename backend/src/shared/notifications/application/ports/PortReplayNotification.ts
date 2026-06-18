import { CommandeRejouerNotification } from '../commands';
import { DtoDetailsNotification } from '../dto';

// Ce fichier declare le port entrant de rejeu de notification.

/** Cette interface expose le cas d'usage de rejeu technique d'une notification. */
export interface PortReplayNotification {
  /** Cette methode orchestre un rejeu technique de notification. */
  executer(commande: CommandeRejouerNotification): Promise<DtoDetailsNotification>;
}
