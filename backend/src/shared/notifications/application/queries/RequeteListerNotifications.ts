// Ce fichier decrit la requete applicative de recherche paginee de notifications.

/** Cette interface porte les filtres de lecture liste des notifications. */
export interface RequeteListerNotifications {
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly destinataireId?: string;
  readonly statut?: string;
  readonly type?: string;
  readonly canal?: string;
  readonly page: number;
  readonly taillePage: number;
  readonly dateDebut?: Date;
  readonly dateFin?: Date;
}
