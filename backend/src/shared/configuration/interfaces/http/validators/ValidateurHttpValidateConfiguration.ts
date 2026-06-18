import type { DtoHttpValidateConfiguration } from '../dto/inputs';

// Ce fichier declare le validateur HTTP de validation.

export class ValidateurHttpValidateConfiguration {
  public static valider(body: unknown): DtoHttpValidateConfiguration {
    return body as DtoHttpValidateConfiguration;
  }
}
