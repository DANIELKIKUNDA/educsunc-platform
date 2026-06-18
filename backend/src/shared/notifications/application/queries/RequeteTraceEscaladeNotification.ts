// Ce fichier decrit la requete applicative de trace d'escalade.

/** Cette interface porte les informations minimales pour consulter l'historique d'escalade. */
export interface RequeteTraceEscaladeNotification {
  readonly identifiantNotification: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
}
