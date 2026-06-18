import { ConfigurationId } from '../value-objects';

// Ce fichier declare l evenement de deverrouillage.

export interface ConfigurationUnlockedProps {
  readonly configurationId: ConfigurationId;
  readonly unlockedAt: Date;
  readonly actorId?: string;
}

export class ConfigurationUnlocked {
  constructor(private readonly props: ConfigurationUnlockedProps) {}

  public valeur(): ConfigurationUnlockedProps {
    return { ...this.props };
  }
}
