// Ce fichier decrit la commande applicative de pilotage du retry.

/** Cette interface porte la demande de retry, d'annulation ou de replanification d'un retry. */
export interface CommandeControlerRetryNotification {
  readonly identifiantNotification: string;
  readonly acteurId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly raison: string;
  readonly action: 'PLANIFIER' | 'DEMARRER' | 'ANNULER' | 'FORCER';
}
