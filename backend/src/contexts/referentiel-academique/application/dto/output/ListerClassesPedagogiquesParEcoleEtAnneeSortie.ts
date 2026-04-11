import { ClassePedagogiqueSortie } from './ClassePedagogiqueSortie';

// Ce DTO represente la sortie paginee standard du cas d'usage ListerClassesPedagogiquesParEcoleEtAnnee.
export interface ListerClassesPedagogiquesParEcoleEtAnneeSortie {
  classesPedagogiques: ClassePedagogiqueSortie[];
  total: number;
  page: number;
  taillePage: number;
}
