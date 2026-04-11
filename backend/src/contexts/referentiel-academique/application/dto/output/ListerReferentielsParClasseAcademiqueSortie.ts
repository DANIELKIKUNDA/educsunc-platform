import { ReferentielProgrammeSortie } from './ReferentielProgrammeSortie';

// Ce DTO represente la sortie paginee standard du cas d'usage ListerReferentielsParClasseAcademique.
export interface ListerReferentielsParClasseAcademiqueSortie {
  referentielsProgrammes: ReferentielProgrammeSortie[];
  total: number;
  page: number;
  taillePage: number;
}
