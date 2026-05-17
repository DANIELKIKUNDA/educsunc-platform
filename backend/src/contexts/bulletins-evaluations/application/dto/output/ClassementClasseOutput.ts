import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import type { LigneClassementOutput } from './LigneClassementOutput';

// Ce DTO represente un classement complet de classe sur une colonne.
export interface ClassementClasseOutput {
  idClassementColonneClasse: string;
  idClassePedagogique: string;
  idAnneeScolaire: string;
  codeColonne: CodeColonneBulletin;
  lignes: LigneClassementOutput[];
}
