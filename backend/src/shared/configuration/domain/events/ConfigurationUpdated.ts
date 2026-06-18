import { ConfigurationId } from '../value-objects';

// Ce fichier declare l evenement de mise a jour de configuration.

export interface ConfigurationUpdatedProps {
  readonly configurationId: ConfigurationId;
  readonly updatedAt: Date;
  readonly actorId?: string;
}

export class ConfigurationUpdated {
  constructor(private readonly props: ConfigurationUpdatedProps) {}

  public valeur(): ConfigurationUpdatedProps {
    return { ...this.props };
  }
}
