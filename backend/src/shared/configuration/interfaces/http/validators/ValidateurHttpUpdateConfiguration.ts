import type { DtoHttpUpdateConfiguration } from '../dto/inputs';

// Ce fichier declare le validateur HTTP de mise a jour.

export class ValidateurHttpUpdateConfiguration {
  public static valider(params: { id?: string }, body: unknown): DtoHttpUpdateConfiguration & { configurationId: string } {
    return {
      ...(body as DtoHttpUpdateConfiguration),
      configurationId: params.id ?? '',
    };
  }
}
