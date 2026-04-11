import { TypeStructureEvaluation } from '../../../domain/value-objects/TypeStructureEvaluation';
import { EnregistrementLigneReferentielProgrammeJson } from './EnregistrementLigneReferentielProgrammeJson';

// Cette interface represente un programme academique brut importe depuis un contenu JSON deja parse.
export interface EnregistrementReferentielProgrammeJson {
  idClasseAcademique: string;
  typeStructureEvaluation: TypeStructureEvaluation;
  versionReferentiel: string;
  datePublication: Date;
  lignes: EnregistrementLigneReferentielProgrammeJson[];
}

// Ce DTO represente les donnees attendues pour importer les programmes academiques depuis un JSON.
export interface ImporterProgrammesAcademiquesDepuisJsonEntree {
  programmes: EnregistrementReferentielProgrammeJson[];
  importePar: string;
}
