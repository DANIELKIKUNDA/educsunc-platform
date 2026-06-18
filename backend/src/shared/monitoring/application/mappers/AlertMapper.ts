import { Alerte } from '../../domain';
import type { AlertDto } from '../dto/output';

// Ce fichier declare le mapper d alertes.

/** Cette classe transforme les alertes en DTO applicatifs. */
export class AlertMapper {
  /** Cette methode projette une alerte en DTO. */
  public versDto(alerte: Alerte): AlertDto {
    return alerte.valeur();
  }
}
