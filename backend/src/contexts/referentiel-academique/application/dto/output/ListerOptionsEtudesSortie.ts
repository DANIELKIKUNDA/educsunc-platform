import { OptionEtudeSortie } from './OptionEtudeSortie';

// Ce DTO represente la sortie paginee standard du cas d'usage ListerOptionsEtudes.
export interface ListerOptionsEtudesSortie {
  optionsEtudes: OptionEtudeSortie[];
  total: number;
  page: number;
  taillePage: number;
}
