import type { CodeColonneBulletin } from '../../domain/value-objects/CodeColonneBulletin';
import type { SexeEleve } from '../../domain/value-objects/SexeEleve';

// Ce read model represente un eleve en echec pour une colonne donnee.
export interface EleveEchecReadModel {
  idEleve: string;
  nomComplet: string;
  sexe: SexeEleve | undefined;
  idClassePedagogique: string;
  codeColonne: CodeColonneBulletin;
  pourcentage?: number;
  rang?: number;
  nombreEchecs: number;
  nombreEchecsProfonds: number;
  eligiblePerequation: boolean;
  eligibleRepechage: boolean;
}
