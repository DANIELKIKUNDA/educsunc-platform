import type { SexeEleve } from 'contexts/bulletins-evaluations/domain/value-objects/SexeEleve';
import type { StatutProclamationEleve } from 'contexts/bulletins-evaluations/domain/value-objects/StatutProclamationEleve';

// Ce DTO represente une ligne de proclamation prete a l'affichage.
export interface LigneProclamationOutput {
  rang?: number;
  idEleve: string;
  nomComplet: string;
  sexe: SexeEleve;
  totalObtenu?: number;
  maximumGeneral?: number;
  pourcentage?: number;
  observation?: string;
  statutProclamation: StatutProclamationEleve;
}
