import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';

// Ce DTO porte les informations necessaires au recalcul du classement d'une classe.
export interface RecalculerClassementInput {
  idClassePedagogique: string;
  idAnneeScolaire: string;
  codeColonne: CodeColonneBulletin;
}
