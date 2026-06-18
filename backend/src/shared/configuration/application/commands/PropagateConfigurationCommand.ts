// Ce fichier declare la commande de propagation de configuration.

/** Cette interface represente la demande de propagation d une configuration. */
export interface PropagateConfigurationCommand {
  readonly configurationId: string;
  readonly actorId?: string;
  readonly canauxCibles?: readonly string[];
}
