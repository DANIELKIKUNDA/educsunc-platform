import type { DtoHttpDashboardMonitoring, DtoHttpObservabilitySnapshot, DtoHttpSystemState } from '../dto/outputs';

// Ce fichier declare les contrats HTTP Monitoring globaux.

/** Cette interface represente les sorties HTTP globales Monitoring. */
export interface ContratsHttpMonitoring {
  readonly etatSysteme: DtoHttpSystemState;
  readonly tableauBord: DtoHttpDashboardMonitoring;
  readonly observabilite: DtoHttpObservabilitySnapshot;
}
