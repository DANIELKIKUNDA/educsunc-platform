import type { DtoHttpOpenIncident } from '../dto/inputs';

// Ce fichier declare le validateur HTTP d ouverture d incident.

export class ValidateurHttpOpenIncident {
  public static valider(entree: unknown): DtoHttpOpenIncident {
    return entree as DtoHttpOpenIncident;
  }
}
