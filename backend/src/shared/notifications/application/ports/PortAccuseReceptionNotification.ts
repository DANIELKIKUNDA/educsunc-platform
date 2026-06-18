import { CommandeAccuserReceptionNotification } from '../commands';
import { DtoDetailsNotification } from '../dto';

// Ce fichier declare le port entrant d'accuse de reception.

/** Cette interface expose le cas d'usage d'accuse de reception. */
export interface PortAccuseReceptionNotification {
  /** Cette methode accuse la reception ou la lecture d'une notification. */
  executer(commande: CommandeAccuserReceptionNotification): Promise<DtoDetailsNotification>;
}
