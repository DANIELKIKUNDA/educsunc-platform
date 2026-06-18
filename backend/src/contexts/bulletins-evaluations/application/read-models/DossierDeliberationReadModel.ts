import type { CodeColonneBulletin } from '../../domain/value-objects/CodeColonneBulletin';
import type { SexeEleve } from '../../domain/value-objects/SexeEleve';

// Ce read model represente le dossier analytique d'un eleve a deliberer.
export interface DossierDeliberationReadModel {
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
  eligiblePerequation: boolean;
  eligibleRepechage: boolean;
  commentaireTechnique?: string;
}
