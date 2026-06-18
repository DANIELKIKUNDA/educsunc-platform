// Ce fichier declare l entite de trace de changement configuration.

/** Cette union represente les natures metier de changement supportees. */
export type TypeChangementConfiguration =
  | 'CREATED'
  | 'UPDATED'
  | 'LOCKED'
  | 'UNLOCKED'
  | 'OVERRIDDEN'
  | 'SNAPSHOT_CREATED'
  | 'ROLLBACK_EXECUTED';

/** Cette interface represente un changement trace dans le domaine. */
export interface ConfigurationChangeProps {
  readonly type: TypeChangementConfiguration;
  readonly actorId?: string;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly changedAt: Date;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/** Cette classe represente un changement gouverne sur une configuration. */
export class ConfigurationChange {
  constructor(private readonly props: ConfigurationChangeProps) {}

  /** Cette methode retourne les donnees du changement. */
  public valeur(): ConfigurationChangeProps {
    return { ...this.props, metadata: { ...this.props.metadata } };
  }
}
