import type { SexeEleve } from 'contexts/bulletins-evaluations/domain/value-objects/SexeEleve';
import type { TypeStructureEvaluation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeStructureEvaluation';
import type { LigneFicheCotationOutput } from './LigneFicheCotationOutput';

export interface IdentiteEleveFicheCotationOutput {
  nomComplet: string;
  sexe: SexeEleve;
  matricule?: string;
  nom?: string;
  postNom?: string;
  prenom?: string;
}

// Ce DTO represente une fiche de cotation complete prete a l'affichage.
export interface FicheCotationOutput {
  idFicheCotationEleveCours: string;
  idEleve: string;
  identiteEleve?: IdentiteEleveFicheCotationOutput;
  idReferentielCours: string;
  idAnneeScolaire: string;
  typeStructureEvaluation: TypeStructureEvaluation;
  estCalculable: boolean;
  aExamen: boolean;
  colonnes: LigneFicheCotationOutput[];
  version: number;
}
