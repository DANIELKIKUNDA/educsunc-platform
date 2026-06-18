import { CommandeRejouerNotification } from '../commands';
import { DtoRejeuNotification } from '../dto';

// Ce fichier transforme le DTO de rejeu en commande applicative.

/** Cette classe convertit un DTO de rejeu en commande exploitable. */
export class MappeurRejeuNotification {
  /** Cette methode recopie proprement le contrat de rejeu. */
  public static versCommande(dto: DtoRejeuNotification): CommandeRejouerNotification {
    return { ...dto };
  }
}
