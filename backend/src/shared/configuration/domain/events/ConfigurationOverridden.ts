import { ConfigurationId, ConfigurationScope } from '../value-objects';

// Ce fichier declare l evenement de surcharge.

export interface ConfigurationOverriddenProps {
  readonly configurationId: ConfigurationId;
  readonly scope: ConfigurationScope;
  readonly overriddenAt: Date;
  readonly actorId?: string;
}

export class ConfigurationOverridden {
  constructor(private readonly props: ConfigurationOverriddenProps) {}

  public valeur(): ConfigurationOverriddenProps {
    return { ...this.props };
  }
}
