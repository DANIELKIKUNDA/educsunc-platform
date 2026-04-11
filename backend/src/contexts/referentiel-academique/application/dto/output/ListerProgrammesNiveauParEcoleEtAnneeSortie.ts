import { ProgrammeNiveauSortie } from './ProgrammeNiveauSortie';

// Ce DTO represente la sortie paginee standard du cas d'usage ListerProgrammesNiveauParEcoleEtAnnee.
export interface ListerProgrammesNiveauParEcoleEtAnneeSortie {
  programmesNiveau: ProgrammeNiveauSortie[];
  total: number;
  page: number;
  taillePage: number;
}
