import { CommandeCreerNotification } from '../commands';
import { DtoCommandeCreationNotification } from '../dto';

// Ce fichier transforme le DTO de creation en commande applicative.

/** Cette classe convertit un DTO de creation en commande exploitable par l'application. */
export class MappeurCommandeCreationNotification {
  /** Cette methode convertit les dates et preserve le contrat stable d'entree. */
  public static versCommande(dto: DtoCommandeCreationNotification): CommandeCreerNotification {
    return {
      ...dto,
      datePlanification: dto.datePlanification ? new Date(dto.datePlanification) : undefined,
      dateExpiration: dto.dateExpiration ? new Date(dto.dateExpiration) : undefined,
      placeholders: dto.placeholders ?? {},
      metadonnees: dto.metadonnees ?? {},
    };
  }
}
