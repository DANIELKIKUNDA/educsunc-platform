import type { MonitoringContextInputDto } from './MonitoringContextInputDto';

// Ce fichier declare le DTO d entree d enregistrement de signal.

/** Cette interface represente le DTO d enregistrement d un signal. */
export interface RegisterSignalInputDto {
  readonly type: string;
  readonly source: import('../../../domain').SourceTechnique;
  readonly nom: string;
  readonly valeur: number;
  readonly unite: string;
  readonly contexte: MonitoringContextInputDto;
  readonly correlationId: string;
}
