import type { ConfigurationDiffDto, ConfigurationSnapshotDto } from '../../../../configuration/application';

// Ce fichier declare le presentateur HTTP des snapshots.

export class PresentateurHttpSnapshotsConfiguration {
  public static presenterSnapshot(snapshot: ConfigurationSnapshotDto): ConfigurationSnapshotDto {
    return snapshot;
  }

  public static presenterDiff(diff: ConfigurationDiffDto): ConfigurationDiffDto {
    return diff;
  }
}
