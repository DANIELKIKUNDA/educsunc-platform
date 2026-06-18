import type { MonitoringContextInputDto } from './MonitoringContextInputDto';

// Ce fichier declare le DTO d entree d ouverture d incident.

/** Cette interface represente le DTO d ouverture d incident. */
export interface OpenIncidentInputDto {
  readonly incidentId: string;
  readonly resume: string;
  readonly niveau: import('../../../domain').NiveauSanteSysteme;
  readonly contexte: MonitoringContextInputDto;
  readonly correlationId: string;
}
