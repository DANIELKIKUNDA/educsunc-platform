import type { DtoHttpCreateAlert } from '../dto/inputs';

// Ce fichier declare le validateur HTTP de creation d alerte.

export class ValidateurHttpCreateAlert {
  public static valider(entree: unknown): DtoHttpCreateAlert {
    return entree as DtoHttpCreateAlert;
  }
}
