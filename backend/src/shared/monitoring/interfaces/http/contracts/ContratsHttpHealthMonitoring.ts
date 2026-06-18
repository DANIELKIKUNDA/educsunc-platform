import type { DtoHttpHealthSnapshot, DtoHttpSystemState } from '../dto/outputs';

// Ce fichier declare les contrats HTTP de sante Monitoring.

/** Cette interface represente les sorties HTTP de sante. */
export interface ContratsHttpHealthMonitoring {
  readonly etat: DtoHttpSystemState;
  readonly snapshot: DtoHttpHealthSnapshot;
}
