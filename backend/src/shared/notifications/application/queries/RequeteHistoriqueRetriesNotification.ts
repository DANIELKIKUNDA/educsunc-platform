// Ce fichier decrit la requete applicative de lecture des retries d'une notification.

/** Cette interface porte les informations minimales pour consulter les retries d'une notification. */
export interface RequeteHistoriqueRetriesNotification {
  readonly identifiantNotification: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
}
