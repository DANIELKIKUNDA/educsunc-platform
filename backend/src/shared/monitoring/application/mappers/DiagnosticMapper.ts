import { DiagnosticIncident } from '../../domain';
import type { DiagnosticDto } from '../dto/output';

// Ce fichier declare le mapper de diagnostics.

/** Cette classe transforme les diagnostics en DTO applicatifs. */
export class DiagnosticMapper {
  /** Cette methode projette un diagnostic en DTO. */
  public versDto(diagnostic: DiagnosticIncident): DiagnosticDto {
    return diagnostic.valeur();
  }
}
