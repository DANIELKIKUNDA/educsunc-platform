import type { CodeColonneBulletin } from '../../domain/value-objects/CodeColonneBulletin';
import type { SexeEleve } from '../../domain/value-objects/SexeEleve';

// Ce read model represente un eleve eligible au repechage pour une colonne.
export interface EligibiliteRepechageReadModel {
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
  eligibleRepechage: true;
}
