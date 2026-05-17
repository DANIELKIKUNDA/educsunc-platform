import type { TypeStructureEvaluation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeStructureEvaluation';
import type { LigneFicheCotationOutput } from './LigneFicheCotationOutput';

// Ce DTO represente une fiche de cotation complete prete a l'affichage.
export interface FicheCotationOutput {
  idFicheCotationEleveCours: string;
  idEleve: string;
  idReferentielCours: string;
  idAnneeScolaire: string;
  typeStructureEvaluation: TypeStructureEvaluation;
  estCalculable: boolean;
  aExamen: boolean;
  colonnes: LigneFicheCotationOutput[];
  version: number;
}
