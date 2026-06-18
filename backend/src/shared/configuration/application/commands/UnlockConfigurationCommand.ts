// Ce fichier declare la commande de deverrouillage de configuration.

/** Cette interface represente les donnees necessaires au deverrouillage. */
export interface UnlockConfigurationCommand {
  readonly configurationId: string;
  readonly actorId?: string;
}
