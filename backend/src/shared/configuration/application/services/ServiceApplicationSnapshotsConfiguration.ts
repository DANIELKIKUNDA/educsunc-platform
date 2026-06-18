import { ConfigurationDiffDto, ConfigurationSnapshotDto } from '../dto';

// Ce fichier declare le service applicatif de snapshots.

/** Cette classe centralise les traitements applicatifs autour des snapshots. */
export class ServiceApplicationSnapshotsConfiguration {
  /** Cette methode compare deux snapshots et produit un diff stable. */
  public comparer(
    snapshotSource: ConfigurationSnapshotDto,
    snapshotCible: ConfigurationSnapshotDto,
  ): ConfigurationDiffDto {
    const source = new Map(snapshotSource.valeurs.map((valeur) => [valeur.key, valeur.value]));
    const cible = new Map(snapshotCible.valeurs.map((valeur) => [valeur.key, valeur.value]));

    const ajouts = [...cible.entries()]
      .filter(([key]) => !source.has(key))
      .map(([key, value]) => ({ key, value }));
    const suppressions = [...source.entries()]
      .filter(([key]) => !cible.has(key))
      .map(([key, value]) => ({ key, value }));
    const modifications = [...source.entries()]
      .filter(([key, value]) => cible.has(key) && cible.get(key) !== value)
      .map(([key, value]) => ({
        key,
        avant: value,
        apres: cible.get(key)!,
      }));

    return {
      snapshotSourceId: snapshotSource.identifiantSnapshot,
      snapshotCibleId: snapshotCible.identifiantSnapshot,
      ajouts,
      suppressions,
      modifications,
    };
  }
}
