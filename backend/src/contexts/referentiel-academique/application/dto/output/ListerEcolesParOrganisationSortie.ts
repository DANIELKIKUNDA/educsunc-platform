import { EcoleSortie } from './EcoleSortie';

// Ce DTO represente la sortie paginee standard du cas d'usage ListerEcolesParOrganisation.
export interface ListerEcolesParOrganisationSortie {
  ecoles: EcoleSortie[];
  total: number;
  page: number;
  taillePage: number;
}
