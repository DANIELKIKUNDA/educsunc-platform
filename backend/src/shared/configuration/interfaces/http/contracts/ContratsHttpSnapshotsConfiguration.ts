import type { DtoHttpDiffConfiguration, DtoHttpSnapshotConfiguration } from '../dto/outputs';

// Ce fichier declare les contrats HTTP des snapshots Configuration.

export interface ContratHttpSnapshotConfiguration {
  readonly donnees: DtoHttpSnapshotConfiguration;
}

export interface ContratHttpDiffConfiguration {
  readonly donnees: DtoHttpDiffConfiguration;
}
