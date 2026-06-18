import type { DtoHttpCapacity } from '../dto/outputs';

// Ce fichier declare les contrats HTTP de capacite Monitoring.

/** Cette interface represente les sorties HTTP de capacite. */
export interface ContratsHttpCapaciteMonitoring {
  readonly capacites: readonly DtoHttpCapacity[];
}
