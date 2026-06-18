// Ce fichier decrit la commande applicative d'archivage d'une notification.

/** Cette interface porte la demande d'archivage applicatif d'une notification. */
export interface CommandeArchiverNotification {
  readonly identifiantNotification: string;
  readonly raison: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly acteurId?: string;
}
