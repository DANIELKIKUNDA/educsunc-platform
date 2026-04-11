import { TypeStructureEvaluation } from '../../../domain/value-objects/TypeStructureEvaluation';
import { EnregistrementLigneReferentielProgrammeJson } from './EnregistrementLigneReferentielProgrammeJson';

// Ce DTO represente les donnees attendues pour importer des lignes de programme depuis un JSON.
export interface ImporterLignesProgrammeDepuisJsonEntree {
  lignes: EnregistrementLigneReferentielProgrammeJson[];
  typeStructureEvaluation: TypeStructureEvaluation;
  importePar: string;
}
