import type { DtoHttpIncident } from '../dto/outputs';

// Ce fichier declare les contrats HTTP d incidents Monitoring.

/** Cette interface represente les sorties HTTP d incidents. */
export interface ContratsHttpIncidentsMonitoring {
  readonly incidents: readonly DtoHttpIncident[];
}
