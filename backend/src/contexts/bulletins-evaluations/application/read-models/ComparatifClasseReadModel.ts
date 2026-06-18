import type { CodeColonneBulletin } from '../../domain/value-objects/CodeColonneBulletin';

// Ce read model represente un bloc comparatif de classe pour une colonne donnee.
export interface ComparatifClasseReadModel {
  idClassePedagogique: string;
  libelleClasse: string;
  codeColonne: CodeColonneBulletin;
  participantsTotal: number;
  classesTotal: number;
  nonClassesTotal: number;
  abandonsTotal: number;
  tauxReussite: number;
  tauxEchec: number;
}
