import { IncidentSysteme } from '../aggregates';
import { ExceptionIncidentIncoherent } from '../exceptions';
import { SpecificationIncidentEscalable } from '../specifications';

// Ce fichier declare la politique d escalade d un incident.

/** Cette classe represente la politique d escalade des incidents. */
export class PolitiqueEscaladeIncident {
  constructor(private readonly specification = new SpecificationIncidentEscalable()) {}

  /** Cette methode garantit qu un incident peut etre escalade. */
  public verifier(incident: IncidentSysteme): void {
    if (!this.specification.estSatisfaite(incident)) {
      throw new ExceptionIncidentIncoherent('Cet incident ne peut pas etre escalade dans son etat actuel.');
    }
  }
}
