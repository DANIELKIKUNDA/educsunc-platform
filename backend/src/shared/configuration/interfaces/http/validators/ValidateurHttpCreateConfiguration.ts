import type { DtoHttpCreateConfiguration } from '../dto/inputs';

// Ce fichier declare le validateur HTTP de creation.

export class ValidateurHttpCreateConfiguration {
  public static valider(body: unknown): DtoHttpCreateConfiguration {
    return body as DtoHttpCreateConfiguration;
  }
}
