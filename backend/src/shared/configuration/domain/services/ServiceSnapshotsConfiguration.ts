import { ConfigurationSnapshot } from '../aggregates';
import { EffectiveValue } from '../value-objects';

// Ce fichier declare le service metier de snapshots.

/** Cette classe centralise la creation de snapshots metier lisibles. */
export class ServiceSnapshotsConfiguration {
  /** Cette methode cree un snapshot immuable a partir des valeurs effectives. */
  public creer(
    identifiantSnapshot: string,
    configurationId: string,
    valeurs: readonly EffectiveValue[],
    creeLe = new Date(),
  ): ConfigurationSnapshot {
    return new ConfigurationSnapshot(identifiantSnapshot, configurationId, valeurs, creeLe);
  }
}
