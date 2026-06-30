import { CodeQualificationFinanciereEleve } from '../../../domain/value-objects/CodeQualificationFinanciereEleve';
import { StatutQualificationFinanciereEleve } from '../../../domain/value-objects/StatutQualificationFinanciereEleve';

export interface QualificationFinanciereEleveOutput {
  idQualification: string;
  idOrganisation?: string;
  idEcole: string;
  idEleve: string;
  codeQualification: CodeQualificationFinanciereEleve;
  statut: StatutQualificationFinanciereEleve;
  raison?: string;
  dateDebutEffet?: string;
  dateFinEffet?: string;
  details?: Record<string, unknown>;
  creePar: string;
  creeLe: string;
  version: number;
}
