import { ValeurConfiguration } from '../../domain';

// Ce fichier declare le DTO de difference entre snapshots.

/** Cette interface represente la difference entre deux snapshots de configuration. */
export interface ConfigurationDiffDto {
  readonly snapshotSourceId: string;
  readonly snapshotCibleId: string;
  readonly ajouts: readonly {
    readonly key: string;
    readonly value: ValeurConfiguration;
  }[];
  readonly suppressions: readonly {
    readonly key: string;
    readonly value: ValeurConfiguration;
  }[];
  readonly modifications: readonly {
    readonly key: string;
    readonly avant: ValeurConfiguration;
    readonly apres: ValeurConfiguration;
  }[];
}
