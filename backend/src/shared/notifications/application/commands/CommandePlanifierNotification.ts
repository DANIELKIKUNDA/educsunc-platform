// Ce fichier decrit la commande applicative de planification d'une notification.

/** Cette interface porte la date et les conditions de planification d'une notification. */
export interface CommandePlanifierNotification {
  readonly identifiantNotification: string;
  readonly datePlanification: Date;
  readonly fuseauHoraire?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
}
