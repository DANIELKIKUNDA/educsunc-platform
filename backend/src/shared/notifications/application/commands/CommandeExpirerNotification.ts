// Ce fichier decrit la commande applicative d'expiration d'une notification.

/** Cette interface porte la demande d'expiration anticipee ou planifiee d'une notification. */
export interface CommandeExpirerNotification {
  readonly identifiantNotification: string;
  readonly raison: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly acteurId?: string;
}
