// Ce fichier declare le validateur HTTP de comparaison de snapshots.

export class ValidateurHttpCompareSnapshotsConfiguration {
  public static valider(params: { id?: string }, query: { sourceId?: string; cibleId?: string }): {
    configurationId: string;
    snapshotSourceId: string;
    snapshotCibleId: string;
  } {
    return {
      configurationId: params.id ?? '',
      snapshotSourceId: query.sourceId ?? '',
      snapshotCibleId: query.cibleId ?? '',
    };
  }
}
