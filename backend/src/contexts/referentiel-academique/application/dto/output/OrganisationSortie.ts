import { TypeOrganisation } from '../../../domain/value-objects/TypeOrganisation';

// Ce DTO represente la forme de sortie standard d'une organisation cote application.
export interface OrganisationSortie {
  id: string;
  code: string;
  nom: string;
  typeOrganisation: TypeOrganisation;
  actif: boolean;
  creeLe: string;
  creePar?: string;
  description?: string;
  version: number;
}
