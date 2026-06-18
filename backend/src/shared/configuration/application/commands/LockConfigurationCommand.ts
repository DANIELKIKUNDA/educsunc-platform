import { NiveauConfiguration } from '../../domain';

// Ce fichier declare la commande de verrouillage de configuration.

/** Cette interface represente les donnees necessaires au verrouillage. */
export interface LockConfigurationCommand {
  readonly configurationId: string;
  readonly niveauMinimalAutorise: NiveauConfiguration;
  readonly actorId: string;
  readonly raison?: string;
}
