// Ce fichier declare la commande de reload runtime.

/** Cette interface represente la demande de rechargement runtime d une configuration. */
export interface ReloadRuntimeConfigurationCommand {
  readonly configurationId: string;
  readonly actorId?: string;
  readonly forcer?: boolean;
}
