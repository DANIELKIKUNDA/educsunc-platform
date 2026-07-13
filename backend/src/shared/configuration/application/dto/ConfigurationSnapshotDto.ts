import { NiveauConfiguration, ValeurConfiguration } from '../../domain';

// Ce fichier declare le DTO de snapshot.

/** Cette interface represente un instantane lisible de configuration. */
export interface ConfigurationSnapshotDto {
  readonly identifiantSnapshot: string;
  readonly configurationId: string;
  readonly creeLe: Date;
  readonly valeurs: readonly {
    readonly key: string;
    readonly value: ValeurConfiguration;
    readonly sourceNiveau: NiveauConfiguration;
    readonly herite: boolean;
    readonly verrouille: boolean;
    readonly explanation: string;
  }[];
}
