// Ce fichier decrit la requete applicative de details d'une notification.

/** Cette interface porte l'identite de la notification a consulter. */
export interface RequeteDetailsNotification {
  readonly identifiantNotification: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
}
