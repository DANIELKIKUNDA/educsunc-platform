import { ClasseAcademiqueSortie } from './ClasseAcademiqueSortie';

// Ce DTO represente la sortie paginee standard du cas d'usage ListerClassesAcademiques.
export interface ListerClassesAcademiquesSortie {
  classesAcademiques: ClasseAcademiqueSortie[];
  total: number;
  page: number;
  taillePage: number;
}
