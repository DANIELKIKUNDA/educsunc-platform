// Ce fichier decrit la requete applicative de monitoring des notifications.

/** Cette interface porte les filtres de supervision et de monitoring des notifications. */
export interface RequeteMonitoringNotifications {
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly criticite?: 'BEST_EFFORT' | 'IMPORTANT' | 'STRICT';
  readonly inclureDeadLetter?: boolean;
  readonly inclureQueues?: boolean;
  readonly inclureFournisseurs?: boolean;
}
