import type { DtoHttpReloadConfiguration } from '../dto/inputs';

// Ce fichier declare le validateur HTTP de reload.

export class ValidateurHttpReloadConfiguration {
  public static valider(params: { id?: string }, body: unknown): DtoHttpReloadConfiguration & { configurationId: string } {
    return {
      ...(body as DtoHttpReloadConfiguration),
      configurationId: params.id ?? '',
    };
  }
}
