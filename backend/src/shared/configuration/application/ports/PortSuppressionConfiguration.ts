import { ConfigurationId } from '../../domain';

// Ce fichier declare le port de suppression applicative.

/** Cette interface represente la suppression technique d une configuration. */
export interface PortSuppressionConfiguration {
  supprimer(identifiant: ConfigurationId): Promise<void>;
}
