import { ConfigurationId } from '../value-objects';

// Ce fichier declare l evenement de creation de snapshot.

export interface ConfigurationSnapshotCreatedProps {
  readonly configurationId: ConfigurationId;
  readonly snapshotId: string;
  readonly createdAt: Date;
}

export class ConfigurationSnapshotCreated {
  constructor(private readonly props: ConfigurationSnapshotCreatedProps) {}

  public valeur(): ConfigurationSnapshotCreatedProps {
    return { ...this.props };
  }
}
