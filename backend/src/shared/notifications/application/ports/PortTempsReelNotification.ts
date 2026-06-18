// Ce fichier declare le port applicatif du futur temps reel Notifications.

/** Cette interface isole la diffusion temps reel future sans exposer de technologie concrete. */
export interface PortTempsReelNotification {
  /** Cette methode publie un message logique vers le futur canal temps reel. */
  publier(sujet: string, donnees: Readonly<Record<string, unknown>>): Promise<void>;
}
