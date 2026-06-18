import { ConfigurationVersion } from '../aggregates';
import { ConfigurationId } from '../value-objects';

// Ce fichier declare le port de repository des versions Configuration.

/** Cette interface represente le port de persistance des versions. */
export interface PortRepositoryConfigurationVersion {
  sauvegarder(version: ConfigurationVersion): Promise<void>;
  listerParConfiguration(identifiant: ConfigurationId): Promise<readonly ConfigurationVersion[]>;
}
