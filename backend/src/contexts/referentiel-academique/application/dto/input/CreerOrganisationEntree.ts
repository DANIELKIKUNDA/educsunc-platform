import { TypeOrganisation } from '../../../domain/value-objects/TypeOrganisation';

// Ce DTO represente les donnees attendues pour creer une organisation.
export interface CreerOrganisationEntree {
  code: string;
  nom: string;
  typeOrganisation: TypeOrganisation;
  creePar: string;
  description?: string;
}
