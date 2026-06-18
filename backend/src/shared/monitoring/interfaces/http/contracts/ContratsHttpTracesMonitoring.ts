import type { DtoHttpTrace } from '../dto/outputs';

// Ce fichier declare les contrats HTTP de traces Monitoring.

/** Cette interface represente les sorties HTTP de traces. */
export interface ContratsHttpTracesMonitoring {
  readonly traces: readonly DtoHttpTrace[];
}
