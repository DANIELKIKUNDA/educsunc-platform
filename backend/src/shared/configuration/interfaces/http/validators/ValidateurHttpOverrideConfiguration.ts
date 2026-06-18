import type { DtoHttpOverrideConfiguration } from '../dto/inputs';

// Ce fichier declare le validateur HTTP d override.

export class ValidateurHttpOverrideConfiguration {
  public static valider(params: { id?: string }, body: unknown): DtoHttpOverrideConfiguration & { configurationId: string } {
    return {
      ...(body as DtoHttpOverrideConfiguration),
      configurationId: params.id ?? '',
    };
  }
}
