import { ConfigurationId, ConfigurationScope } from '../value-objects';

// Ce fichier declare l evenement de creation de configuration.

/** Cette interface represente les donnees metier de creation. */
export interface ConfigurationCreatedProps {
  readonly configurationId: ConfigurationId;
  readonly scope: ConfigurationScope;
  readonly createdAt: Date;
  readonly actorId?: string;
}

/** Cette classe represente l evenement de creation d une configuration. */
export class ConfigurationCreated {
  constructor(private readonly props: ConfigurationCreatedProps) {}

  /** Cette methode retourne les donnees de l evenement. */
  public valeur(): ConfigurationCreatedProps {
    return { ...this.props };
  }
}
