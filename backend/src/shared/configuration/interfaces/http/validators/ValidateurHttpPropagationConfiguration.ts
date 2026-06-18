import type { DtoHttpPropagationConfiguration } from '../dto/inputs';

// Ce fichier declare le validateur HTTP de propagation.

export class ValidateurHttpPropagationConfiguration {
  public static valider(params: { id?: string }, body: unknown): DtoHttpPropagationConfiguration & { configurationId: string } {
    return {
      ...(body as DtoHttpPropagationConfiguration),
      configurationId: params.id ?? '',
    };
  }
}
