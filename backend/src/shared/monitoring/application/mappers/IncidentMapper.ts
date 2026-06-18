import { IncidentSysteme } from '../../domain';
import type { IncidentDto } from '../dto/output';

// Ce fichier declare le mapper d incidents.

/** Cette classe transforme les incidents en DTO applicatifs. */
export class IncidentMapper {
  /** Cette methode projette un incident en DTO. */
  public versDto(incident: IncidentSysteme): IncidentDto {
    return incident.details();
  }
}
