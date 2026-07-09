import { TypeOrganisation } from '../../../domain/value-objects/TypeOrganisation';

export interface PromoteurPrincipalEntree {
  nomComplet: string;
  email: string;
  telephone?: string;
  identifiant?: string;
  motDePasseInitial: string;
}

// Ce DTO represente les donnees attendues pour creer une organisation.
export interface CreerOrganisationEntree {
  code: string;
  nom: string;
  typeOrganisation: TypeOrganisation;
  creePar: string;
  description?: string;
  promoteurPrincipal?: PromoteurPrincipalEntree;
}
