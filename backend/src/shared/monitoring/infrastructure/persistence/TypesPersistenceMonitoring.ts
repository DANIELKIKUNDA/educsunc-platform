import type {
  Alerte,
  CapaciteSysteme,
  DiagnosticIncident,
  IncidentSysteme,
  MetriqueMetier,
  MetriqueTechnique,
  Saturation,
  TraceOperation,
} from '../../domain';

// Ce fichier declare les types de stockage memoire Monitoring.

/** Cette interface represente une entree de stockage d alerte. */
export interface EntreeStockageAlerteMonitoring {
  readonly alerte: Alerte;
  readonly sauvegardeLe: Date;
}

/** Cette interface represente une entree de stockage d incident. */
export interface EntreeStockageIncidentMonitoring {
  readonly incident: IncidentSysteme;
  readonly sauvegardeLe: Date;
}

/** Cette interface represente une entree de stockage de diagnostic. */
export interface EntreeStockageDiagnosticMonitoring {
  readonly diagnostic: DiagnosticIncident;
  readonly sauvegardeLe: Date;
}

/** Cette interface represente une entree de stockage de trace. */
export interface EntreeStockageTraceMonitoring {
  readonly trace: TraceOperation;
  readonly sauvegardeLe: Date;
}

/** Cette interface represente une entree de stockage de metrique. */
export interface EntreeStockageMetriqueMonitoring {
  readonly cle: string;
  readonly metrique: MetriqueMetier | MetriqueTechnique;
  readonly sauvegardeLe: Date;
}

/** Cette interface represente une entree de stockage de capacite. */
export interface EntreeStockageCapaciteMonitoring {
  readonly capacite: CapaciteSysteme;
  readonly sauvegardeLe: Date;
}

/** Cette interface represente une entree de stockage de saturation. */
export interface EntreeStockageSaturationMonitoring {
  readonly saturation: Saturation;
  readonly sauvegardeLe: Date;
}
