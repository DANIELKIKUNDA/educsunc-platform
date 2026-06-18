import { CommandeEscaladerNotification } from '../commands';
import { DtoDetailsNotification } from '../dto';

// Ce fichier declare le port entrant d'escalade de notification.

/** Cette interface expose le cas d'usage d'escalade de notification. */
export interface PortEscaladeNotification {
  /** Cette methode orchestre une escalation applicative. */
  executer(commande: CommandeEscaladerNotification): Promise<DtoDetailsNotification>;
}
