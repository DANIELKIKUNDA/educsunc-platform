// Ce fichier expose le DTO HTTP de sortie pour les contrats futurs de temps reel Notifications.

/** Cette interface represente les capacites HTTP exposees pour le futur temps reel. */
export interface DtoHttpTempsReelNotificationFutur {
  readonly disponible: boolean;
  readonly canaux: readonly string[];
  readonly mode: 'PREPARATOIRE';
}
