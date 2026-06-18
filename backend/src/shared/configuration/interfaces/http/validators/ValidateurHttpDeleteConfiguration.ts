// Ce fichier declare le validateur HTTP de suppression.

export class ValidateurHttpDeleteConfiguration {
  public static valider(params: { id?: string }, body?: { actorId?: string; raison?: string }): {
    configurationId: string;
    actorId?: string;
    raison?: string;
  } {
    return {
      configurationId: params.id ?? '',
      actorId: body?.actorId,
      raison: body?.raison,
    };
  }
}
