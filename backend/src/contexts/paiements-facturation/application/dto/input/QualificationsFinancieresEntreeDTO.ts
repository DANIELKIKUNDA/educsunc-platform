import { CodeQualificationFinanciereEleve } from '../../../domain/value-objects/CodeQualificationFinanciereEleve';

export interface ActiverQualificationFinanciereEleveInput {
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  roleActif?: string;
  idEleve: string;
  codeQualification: CodeQualificationFinanciereEleve;
  raison?: string;
  dateDebutEffet?: string;
  details?: Record<string, unknown>;
}

export interface DesactiverQualificationFinanciereEleveInput {
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  roleActif?: string;
  idQualification: string;
  raison?: string;
  dateFinEffet?: string;
}

export interface ListerQualificationsFinancieresEleveInput {
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  roleActif?: string;
  idEleve: string;
}
