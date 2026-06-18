import type { NiveauConfiguration } from '../../../../configuration/domain';

// Ce fichier declare le validateur HTTP de verrouillage.

export class ValidateurHttpLockConfiguration {
  public static valider(
    params: { id?: string },
    body: { niveauMinimalAutorise: NiveauConfiguration; actorId: string; raison?: string },
  ): { configurationId: string; niveauMinimalAutorise: NiveauConfiguration; actorId: string; raison?: string } {
    return {
      configurationId: params.id ?? '',
      niveauMinimalAutorise: body.niveauMinimalAutorise,
      actorId: body.actorId,
      raison: body.raison,
    };
  }
}
