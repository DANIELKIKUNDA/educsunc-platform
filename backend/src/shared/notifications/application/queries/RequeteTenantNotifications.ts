// Ce fichier decrit la requete applicative de lecture tenant-aware des notifications.

/** Cette interface porte les filtres de lecture consolides a l'echelle tenant. */
export interface RequeteTenantNotifications {
  readonly organisationId: string;
  readonly ecoleId?: string;
  readonly inclureArchives?: boolean;
  readonly inclureDeadLetters?: boolean;
  readonly inclureMonitoring?: boolean;
}
