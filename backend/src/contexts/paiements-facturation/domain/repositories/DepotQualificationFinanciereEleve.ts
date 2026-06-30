import { QualificationFinanciereEleve } from '../aggregates/QualificationFinanciereEleve';
import { CodeQualificationFinanciereEleve } from '../value-objects/CodeQualificationFinanciereEleve';

export interface DepotQualificationFinanciereEleve {
  sauvegarder(qualification: QualificationFinanciereEleve): Promise<void>;
  trouverParId(idQualification: string): Promise<QualificationFinanciereEleve | null>;
  trouverActiveParEleveEtCode(params: {
    idEcole: string;
    idEleve: string;
    codeQualification: CodeQualificationFinanciereEleve;
  }): Promise<QualificationFinanciereEleve | null>;
  listerParEleve(idEcole: string, idEleve: string): Promise<QualificationFinanciereEleve[]>;
}
