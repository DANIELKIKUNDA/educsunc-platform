import type { CodeColonneBulletin } from '../../domain/value-objects/CodeColonneBulletin';
import type { SexeEleve } from '../../domain/value-objects/SexeEleve';

// Ce read model represente un eleve eligible a la perequation pour une colonne.
export interface EligibilitePerequationReadModel {
  idEleve: string;
  nomComplet: string;
  sexe: SexeEleve | undefined;
  idClassePedagogique: string;
  codeColonne: CodeColonneBulletin;
  pourcentage?: number;
  rang?: number;
  nombreEchecs: number;
  nombreEchecsLegers: number;
  nombreEchecsProfonds: number;
  eligiblePerequation: true;
}
