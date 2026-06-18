import { IncidentSysteme } from '../aggregates';

// Ce fichier declare la specification d escalade d un incident.

/** Cette classe represente la specification d escalade d un incident. */
export class SpecificationIncidentEscalable {
  /** Cette methode indique si un incident peut etre escalade. */
  public estSatisfaite(incident: IncidentSysteme): boolean {
    const details = incident.details();
    return details.statut !== 'RESOLVED' && details.alertes.length > 0;
  }
}
