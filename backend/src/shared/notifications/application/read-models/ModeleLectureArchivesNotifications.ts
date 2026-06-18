// Ce fichier decrit le modele de lecture des notifications archivees.

/** Cette interface represente une ligne d'archive de notification. */
export interface ElementArchiveNotification {
  readonly identifiantNotification: string;
  readonly type: string;
  readonly dateArchivage: Date;
  readonly raisonArchivage?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
}

/** Cette interface represente un resultat pagine d'archives Notifications. */
export interface ModeleLectureArchivesNotifications {
  readonly elements: readonly ElementArchiveNotification[];
  readonly page: number;
  readonly taillePage: number;
  readonly total: number;
}
