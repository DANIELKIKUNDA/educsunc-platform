// Ce fichier decrit la requete applicative de lecture des dead letters.

/** Cette interface porte les filtres de lecture des dead letters Notifications. */
export interface RequeteDeadLettersNotifications {
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly page: number;
  readonly taillePage: number;
}
