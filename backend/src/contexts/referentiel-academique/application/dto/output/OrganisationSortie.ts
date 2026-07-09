import { TypeOrganisation } from '../../../domain/value-objects/TypeOrganisation';

export interface PromoteurPrincipalSortie {
  utilisateurId?: string;
  nomComplet: string;
  email?: string;
  telephone?: string;
  identifiant?: string;
}

// Ce DTO represente la forme de sortie standard d'une organisation cote application.
export interface OrganisationSortie {
  id: string;
  code: string;
  nom: string;
  typeOrganisation: TypeOrganisation;
  actif: boolean;
  creeLe: string;
  creePar?: string;
  modifieLe?: string;
  modifiePar?: string;
  description?: string;
  promoteurPrincipal?: PromoteurPrincipalSortie;
  version: number;
}
