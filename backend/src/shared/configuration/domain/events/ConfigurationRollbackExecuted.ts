import { ConfigurationId } from '../value-objects';

// Ce fichier declare l evenement de rollback.

export interface ConfigurationRollbackExecutedProps {
  readonly configurationId: ConfigurationId;
  readonly snapshotId: string;
  readonly executedAt: Date;
  readonly actorId?: string;
}

export class ConfigurationRollbackExecuted {
  constructor(private readonly props: ConfigurationRollbackExecutedProps) {}

  public valeur(): ConfigurationRollbackExecutedProps {
    return { ...this.props };
  }
}
