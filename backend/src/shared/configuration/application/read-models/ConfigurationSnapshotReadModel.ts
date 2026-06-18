import { ConfigurationSnapshotDto } from '../dto';

// Ce fichier declare le read model de snapshots.

/** Cette interface represente la lecture optimisee des snapshots applicatifs. */
export interface ConfigurationSnapshotReadModel {
  trouverParId(
    configurationId: string,
    snapshotId: string,
  ): Promise<ConfigurationSnapshotDto | null>;

  listerParConfiguration(configurationId: string): Promise<readonly ConfigurationSnapshotDto[]>;
}
