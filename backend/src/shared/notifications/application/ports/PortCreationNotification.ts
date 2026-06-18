import { CommandeCreerNotification } from '../commands';
import { DtoDetailsNotification } from '../dto';

// Ce fichier declare le port entrant de creation de notification.

/** Cette interface expose le cas d'usage de creation de notification a l'exterieur de l'application. */
export interface PortCreationNotification {
  /** Cette methode orchestre la creation complete d'une notification. */
  executer(commande: CommandeCreerNotification): Promise<DtoDetailsNotification>;
}
