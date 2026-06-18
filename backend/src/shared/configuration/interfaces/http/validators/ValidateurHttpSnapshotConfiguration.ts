// Ce fichier declare le validateur HTTP de creation de snapshot.

export class ValidateurHttpSnapshotConfiguration {
  public static valider(
    params: { id?: string },
    body?: { snapshotId?: string; actorId?: string },
  ): { configurationId: string; snapshotId?: string; actorId?: string } {
    return {
      configurationId: params.id ?? '',
      snapshotId: body?.snapshotId,
      actorId: body?.actorId,
    };
  }
}
