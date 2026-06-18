// Ce fichier declare la commande de suppression de configuration.

/** Cette interface represente les donnees necessaires a la suppression logique d une configuration. */
export interface DeleteConfigurationCommand {
  readonly configurationId: string;
  readonly actorId?: string;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly raison?: string;
}
