// Ce fichier declare les types techniques du bloc realtime-futur Notifications.

/** Cette interface represente le contexte technique d'une diffusion temps reel. */
export interface ContexteTempsReelNotification {
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly acteurId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/** Cette interface represente un message logique du futur temps reel Notifications. */
export interface MessageTempsReelNotification {
  readonly identifiant: string;
  readonly sujet: string;
  readonly publieLe: Date;
  readonly donnees: Readonly<Record<string, unknown>>;
  readonly contexte: ContexteTempsReelNotification;
}

/** Cette interface represente le resultat d'une publication technique. */
export interface ResultatPublicationTempsReelNotification {
  readonly canal: string;
  readonly succes: boolean;
  readonly publieLe: Date;
  readonly raison?: string;
}

/** Cette interface represente un canal technique futur de diffusion temps reel. */
export interface CanalTempsReelNotification {
  /** Cette methode retourne le nom stable du canal technique. */
  obtenirNom(): string;

  /** Cette methode indique si le canal peut accepter des publications. */
  estDisponible(): boolean;

  /** Cette methode publie un message technique vers le canal futur. */
  publier(message: MessageTempsReelNotification): Promise<ResultatPublicationTempsReelNotification>;
}
