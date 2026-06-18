import type { MonitoringContextInputDto } from './MonitoringContextInputDto';

// Ce fichier declare le DTO d entree de creation d alerte.

/** Cette interface represente le DTO de creation d une alerte. */
export interface CreateAlertInputDto {
  readonly alertId: string;
  readonly indicateur: string;
  readonly warning: number;
  readonly critical: number;
  readonly unite: string;
  readonly valeurObservee: number;
  readonly message: string;
  readonly contexte: MonitoringContextInputDto;
  readonly correlationId: string;
}
