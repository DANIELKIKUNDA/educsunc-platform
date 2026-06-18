// Ce fichier decrit la requete applicative de consultation des archives Notifications.

/** Cette interface porte les filtres de lecture des notifications archivees. */
export interface RequeteArchivesNotifications {
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly page: number;
  readonly taillePage: number;
  readonly dateDebutArchivage?: Date;
  readonly dateFinArchivage?: Date;
}
