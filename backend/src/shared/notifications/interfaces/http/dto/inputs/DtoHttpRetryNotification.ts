// Ce fichier expose le DTO HTTP d'entree pour le pilotage de retry de notification.

/** Cette interface represente le body HTTP de pilotage de retry. */
export interface DtoHttpRetryNotification {
  readonly identifiantNotification?: string;
  readonly raison: string;
  readonly action: 'PLANIFIER' | 'DEMARRER' | 'ANNULER' | 'FORCER';
  readonly acteurId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
}
