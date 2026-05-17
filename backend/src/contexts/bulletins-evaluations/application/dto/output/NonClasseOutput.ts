import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import type { MotifNonClasse } from 'contexts/bulletins-evaluations/domain/value-objects/MotifNonClasse';
import type { SexeEleve } from 'contexts/bulletins-evaluations/domain/value-objects/SexeEleve';

// Ce DTO represente un eleve non classe avec les causes exposees a l'application.
export interface NonClasseOutput {
  idEleve: string;
  nomComplet: string;
  sexe: SexeEleve;
  motifs: MotifNonClasse[];
  coursManquants: string[];
  colonnesManquantes: CodeColonneBulletin[];
}
