import type { IncidentSystemeDetails } from '../aggregates';

// Ce fichier declare l evenement d escalade d un incident.

/** Cette classe represente l escalade d un incident. */
export class IncidentEscalade {
  constructor(public readonly payload: IncidentSystemeDetails) {}
}
