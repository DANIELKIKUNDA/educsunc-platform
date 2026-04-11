import { OrganisationSortie } from './OrganisationSortie';

// Ce DTO represente la sortie paginee standard du cas d'usage ListerOrganisations.
export interface ListerOrganisationsSortie {
  organisations: OrganisationSortie[];
  total: number;
  page: number;
  taillePage: number;
}
