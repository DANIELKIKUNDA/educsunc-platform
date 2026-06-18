import type { IncidentSysteme } from '../aggregates';
import type { FiltreMonitoring } from '../value-objects';

// Ce fichier declare le port de persistence des incidents.

/** Cette interface represente le repository domaine des incidents. */
export interface PortRepositoryIncident {
  sauvegarder(incident: IncidentSysteme): Promise<void> | void;
  rechercherParFiltre(filtre: FiltreMonitoring): Promise<readonly IncidentSysteme[]> | readonly IncidentSysteme[];
}
