// Ce fichier expose le DTO stable des filtres de requete Notifications.

/** Cette interface represente la forme serialisable d'une requete liste/detail. */
export interface DtoRequeteNotification {
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly identifiantNotification?: string;
  readonly destinataireId?: string;
  readonly statut?: string;
  readonly type?: string;
  readonly canal?: string;
  readonly page?: number;
  readonly taillePage?: number;
  readonly dateDebut?: string;
  readonly dateFin?: string;
}
