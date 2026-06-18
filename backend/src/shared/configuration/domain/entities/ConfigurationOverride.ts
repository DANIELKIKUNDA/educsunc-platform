import { ConfigurationKey, ConfigurationScope, ConfigurationValue } from '../value-objects';

// Ce fichier declare l entite de surcharge locale.

/** Cette interface represente une surcharge explicite appliquee sur une configuration. */
export interface ConfigurationOverrideProps {
  readonly key: ConfigurationKey;
  readonly scope: ConfigurationScope;
  readonly value: ConfigurationValue;
  readonly actorId: string;
  readonly raison?: string;
  readonly overrideLe: Date;
}

/** Cette classe represente une surcharge gouvernee d une configuration. */
export class ConfigurationOverride {
  constructor(private readonly props: ConfigurationOverrideProps) {}

  /** Cette methode retourne les donnees de surcharge. */
  public valeur(): ConfigurationOverrideProps {
    return { ...this.props };
  }
}
