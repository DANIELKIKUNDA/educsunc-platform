import { ConfigurationId } from '../value-objects';

// Ce fichier declare l evenement de verrouillage.

export interface ConfigurationLockedProps {
  readonly configurationId: ConfigurationId;
  readonly lockedAt: Date;
  readonly actorId?: string;
}

export class ConfigurationLocked {
  constructor(private readonly props: ConfigurationLockedProps) {}

  public valeur(): ConfigurationLockedProps {
    return { ...this.props };
  }
}
