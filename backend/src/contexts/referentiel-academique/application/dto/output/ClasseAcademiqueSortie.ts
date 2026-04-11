import { TypeStructureEvaluation } from '../../../domain/value-objects/TypeStructureEvaluation';

// Ce DTO represente la forme de sortie standard d'une classe academique cote application.
export interface ClasseAcademiqueSortie {
  id: string;
  idSectionScolaire: string;
  idOptionEtude?: string;
  code: string;
  libelle: string;
  ordrePedagogique: number;
  cycle: string;
  accepteOptions: boolean;
  optionObligatoire: boolean;
  typeStructureEvaluation: TypeStructureEvaluation;
  active: boolean;
  creeLe: string;
  version: number;
  modifieLe?: string;
}
