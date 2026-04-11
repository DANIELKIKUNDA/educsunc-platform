import { EcoleSortie } from './EcoleSortie';

// Ce DTO represente la sortie paginee standard du cas d'usage ListerEcoles.
export interface ListerEcolesSortie {
  ecoles: EcoleSortie[];
  total: number;
  page: number;
  taillePage: number;
}
