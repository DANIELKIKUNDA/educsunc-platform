import type { CodeColonneBulletin } from '../../domain/value-objects/CodeColonneBulletin';

// Ce read model represente un cours qui concentre des echecs sur une classe.
export interface CoursProblematiqueReadModel {
  idReferentielCours: string;
  codeColonne: CodeColonneBulletin;
  effectifEchecs: number;
  effectifEchecsProfonds: number;
  moyennePourcentage: number;
  idsElevesConcernes: string[];
}
