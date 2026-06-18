import { NiveauConfiguration } from '../enums';
import { ConfigurationKey } from '../value-objects';

// Ce fichier declare l entite de verrou de configuration.

/** Cette interface represente les donnees d un verrou metier. */
export interface ConfigurationLockProps {
  readonly key: ConfigurationKey;
  readonly niveauMinimalAutorise: NiveauConfiguration;
  readonly actorId: string;
  readonly raison?: string;
  readonly verrouilleLe: Date;
}

/** Cette classe represente un verrou applique a une cle de configuration. */
export class ConfigurationLock {
  constructor(private readonly props: ConfigurationLockProps) {}

  /** Cette methode retourne les donnees du verrou. */
  public valeur(): ConfigurationLockProps {
    return { ...this.props };
  }
}
