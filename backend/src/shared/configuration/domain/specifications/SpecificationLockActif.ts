import { ConfigurationLock } from '../entities';

// Ce fichier declare la specification de verrou actif.

/** Cette classe indique si une cle de configuration est effectivement verrouillee. */
export class SpecificationLockActif {
  /** Cette methode indique si un verrou actif existe. */
  public estSatisfaitePar(lock: ConfigurationLock | null): boolean {
    return lock !== null;
  }
}
