import type { LigneFicheCotationOutput } from '../dto/output/LigneFicheCotationOutput';

// Ce read model represente une fiche de cotation optimisee pour l'encodage.
export interface FicheCotationReadModel {
  idFicheCotationEleveCours: string;
  idEleve: string;
  idReferentielCours: string;
  idAnneeScolaire: string;
  typeStructureEvaluation: import('contexts/bulletins-evaluations/domain/value-objects/TypeStructureEvaluation').TypeStructureEvaluation;
  estCalculable: boolean;
  aExamen: boolean;
  colonnes: LigneFicheCotationOutput[];
  version: number;
}
