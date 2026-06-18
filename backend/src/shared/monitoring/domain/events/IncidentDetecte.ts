import type { IncidentSystemeDetails } from '../aggregates';

// Ce fichier declare l evenement de detection d un incident.

/** Cette classe represente la detection d un incident. */
export class IncidentDetecte {
  constructor(public readonly payload: IncidentSystemeDetails) {}
}
