// Ce fichier declare le validateur HTTP de deverrouillage.

export class ValidateurHttpUnlockConfiguration {
  public static valider(params: { id?: string }, body?: { actorId?: string }): {
    configurationId: string;
    actorId?: string;
  } {
    return {
      configurationId: params.id ?? '',
      actorId: body?.actorId,
    };
  }
}
