import { AnneeScolaireSortie } from './AnneeScolaireSortie';

// Ce DTO represente la sortie paginee standard du cas d'usage ListerAnneesScolairesParEcole.
export interface ListerAnneesScolairesParEcoleSortie {
  anneesScolaires: AnneeScolaireSortie[];
  total: number;
  page: number;
  taillePage: number;
}
