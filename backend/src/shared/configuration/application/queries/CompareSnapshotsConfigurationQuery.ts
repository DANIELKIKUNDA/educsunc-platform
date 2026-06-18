// Ce fichier declare la query de comparaison de snapshots.

/** Cette interface represente la comparaison de deux snapshots sur une configuration. */
export interface CompareSnapshotsConfigurationQuery {
  readonly configurationId: string;
  readonly snapshotSourceId: string;
  readonly snapshotCibleId: string;
}
