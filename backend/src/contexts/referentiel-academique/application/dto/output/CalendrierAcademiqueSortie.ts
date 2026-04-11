import { TypeStructureEvaluation } from '../../../domain/value-objects/TypeStructureEvaluation';
import { PeriodeCalendrierSortie } from './PeriodeCalendrierSortie';

// Ce DTO represente la forme de sortie standard d'un calendrier academique.
export interface CalendrierAcademiqueSortie {
  id: string;
  idEcole: string;
  idAnneeScolaire: string;
  typeStructureEvaluation: TypeStructureEvaluation;
  dateDebutAnnee: string;
  dateFinAnnee: string;
  creeLe: string;
  creePar?: string;
  modifieLe?: string;
  modifiePar?: string;
  version: number;
  verrouille: boolean;
  periodes: PeriodeCalendrierSortie[];
}
