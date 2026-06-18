import type { DtoHttpMonitoringContext } from './DtoHttpMonitoringContext';

// Ce fichier declare le DTO HTTP de creation d alerte.

/** Cette interface represente le payload HTTP de creation d alerte. */
export interface DtoHttpCreateAlert {
  readonly alertId: string;
  readonly indicateur: string;
  readonly warning: number;
  readonly critical: number;
  readonly unite: string;
  readonly valeurObservee: number;
  readonly message: string;
  readonly contexte: DtoHttpMonitoringContext;
  readonly correlationId: string;
}
