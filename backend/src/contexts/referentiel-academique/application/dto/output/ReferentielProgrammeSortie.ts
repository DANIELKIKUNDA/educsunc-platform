import { TypeStructureEvaluation } from '../../../domain/value-objects/TypeStructureEvaluation';
import { VersionReferentielProgrammeSortie } from './VersionReferentielProgrammeSortie';

// Ce DTO represente la forme de sortie standard d'un referentiel programme cote application.
export interface ReferentielProgrammeSortie {
  id: string;
  idClasseAcademique: string;
  typeStructureEvaluation: TypeStructureEvaluation;
  versionProjectionnee: VersionReferentielProgrammeSortie | null;
  actif: boolean;
  creeLe: string;
  version: number;
}
