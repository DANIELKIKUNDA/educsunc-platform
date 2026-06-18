import { ConfigurationDto } from '../dto';

// Ce fichier declare le read model principal de Configuration.

/** Cette interface represente la lecture applicative optimisee des configurations. */
export interface ConfigurationReadModel {
  trouverParId(configurationId: string): Promise<ConfigurationDto | null>;
}
