import type { NiveauSanteSysteme } from '../../../../domain';
import type { DtoHttpMonitoringContext } from './DtoHttpMonitoringContext';

// Ce fichier declare le DTO HTTP d ouverture d incident.

/** Cette interface represente le payload HTTP d ouverture d incident. */
export interface DtoHttpOpenIncident {
  readonly incidentId: string;
  readonly resume: string;
  readonly niveau: NiveauSanteSysteme;
  readonly contexte: DtoHttpMonitoringContext;
  readonly correlationId: string;
}
