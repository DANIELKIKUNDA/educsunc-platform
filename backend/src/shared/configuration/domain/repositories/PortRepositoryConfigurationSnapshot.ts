import { ConfigurationSnapshot } from '../aggregates';
import { ConfigurationId } from '../value-objects';

// Ce fichier declare le port de repository des snapshots Configuration.

/** Cette interface represente le port de persistance des snapshots. */
export interface PortRepositoryConfigurationSnapshot {
  sauvegarder(snapshot: ConfigurationSnapshot): Promise<void>;
  listerParConfiguration(identifiant: ConfigurationId): Promise<readonly ConfigurationSnapshot[]>;
}
