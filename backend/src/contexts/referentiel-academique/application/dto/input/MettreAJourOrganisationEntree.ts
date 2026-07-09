import { TypeOrganisation } from '../../../domain/value-objects/TypeOrganisation';

export interface MettreAJourOrganisationEntree {
  idOrganisation: string;
  nom: string;
  typeOrganisation: TypeOrganisation;
  description?: string;
  modifiePar: string;
  promoteurPrincipal?: {
    nomComplet: string;
    email?: string;
    telephone?: string;
    identifiant?: string;
  };
}
