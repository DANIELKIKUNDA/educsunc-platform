import { Configuration } from '../aggregates';
import { ConfigurationId } from '../value-objects';

// Ce fichier declare le port de repository principal de Configuration.

/** Cette interface represente le port de persistance des agregats Configuration. */
export interface PortRepositoryConfiguration {
  sauvegarder(configuration: Configuration): Promise<void>;
  trouverParId(identifiant: ConfigurationId): Promise<Configuration | null>;
}
