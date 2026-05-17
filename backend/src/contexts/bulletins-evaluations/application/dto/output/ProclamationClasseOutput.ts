import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import type { TypeProclamation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeProclamation';
import type { AbandonOutput } from './AbandonOutput';
import type { LigneProclamationOutput } from './LigneProclamationOutput';
import type { NonClasseOutput } from './NonClasseOutput';
import type { StatistiquesProclamationOutput } from './StatistiquesProclamationOutput';

// Ce DTO represente une proclamation complete prete a l'affichage.
export interface ProclamationClasseOutput {
  idProclamationClasse: string;
  idClassePedagogique: string;
  idAnneeScolaire: string;
  codeColonne: CodeColonneBulletin;
  typeProclamation: TypeProclamation;
  lignes: LigneProclamationOutput[];
  nonClasses: NonClasseOutput[];
  abandons: AbandonOutput[];
  statistiques?: StatistiquesProclamationOutput;
}
