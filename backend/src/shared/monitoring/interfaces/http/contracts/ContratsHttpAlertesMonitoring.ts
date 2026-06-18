import type { DtoHttpAlert } from '../dto/outputs';

// Ce fichier declare les contrats HTTP d alertes Monitoring.

/** Cette interface represente les sorties HTTP d alertes. */
export interface ContratsHttpAlertesMonitoring {
  readonly alertes: readonly DtoHttpAlert[];
}
