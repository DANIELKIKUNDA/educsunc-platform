import { ReferentielCoursSortie } from './ReferentielCoursSortie';

// Cette interface represente la sortie paginee des cours officiels.
export interface ListerReferentielsCoursSortie {
  referentielsCours: ReferentielCoursSortie[];
  total: number;
  page: number;
  taillePage: number;
}
