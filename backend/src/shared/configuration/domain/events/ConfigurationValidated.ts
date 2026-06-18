import { ConfigurationId } from '../value-objects';

// Ce fichier declare l evenement de validation metier.

export interface ConfigurationValidatedProps {
  readonly configurationId: ConfigurationId;
  readonly validatedAt: Date;
  readonly warnings: readonly string[];
}

export class ConfigurationValidated {
  constructor(private readonly props: ConfigurationValidatedProps) {}

  public valeur(): ConfigurationValidatedProps {
    return { ...this.props, warnings: [...this.props.warnings] };
  }
}
