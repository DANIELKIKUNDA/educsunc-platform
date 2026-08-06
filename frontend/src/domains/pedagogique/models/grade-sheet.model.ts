import type { DetailResponse } from '../../finances/models/payment-history.model';

export type GradeSheetActorCode = 'ENSEIGNANT';

export interface GradeSheetApiColumn {
  codeColonne: string;
  coteObtenue: number | null;
  maximumColonne: number;
  estEchec: boolean;
  styleAffichage?: string;
}

export interface GradeSheetApiRow {
  idFicheCotationEleveCours: string;
  idEleve: string;
  identiteEleve?: {
    nomComplet: string;
    sexe: string;
    matricule?: string;
    nom?: string;
    postNom?: string;
    prenom?: string;
  };
  idReferentielCours: string;
  idAnneeScolaire: string;
  typeStructureEvaluation: 'SEMESTRIEL' | 'TRIMESTRIEL';
  estCalculable: boolean;
  aExamen: boolean;
  colonnes: GradeSheetApiColumn[];
  version: number;
}

export interface GradeSheetFilters {
  idAnneeScolaire: string;
  idClassePedagogique: string;
  idReferentielCours: string;
  anneeScolaireLabel?: string;
  classeLabel?: string;
  coursLabel?: string;
  enseignantLabel?: string;
}

export interface GradeSheetColumnViewModel {
  code: string;
  label: string;
  maximum: number | null;
  isEditable: boolean;
  isTotal: boolean;
  isExam: boolean;
}

export interface GradeSheetCellViewModel {
  code: string;
  value: number | null;
  maximum: number;
  displayValue: string;
  isEditable: boolean;
  isTotal: boolean;
  isFailure: boolean;
  styleAffichage: string;
}

export interface GradeSheetRowViewModel {
  idFicheCotationEleveCours: string;
  idEleve: string;
  eleveLabel: string;
  eleveMetaLabel: string;
  version: number;
  estCalculable: boolean;
  aExamen: boolean;
  cells: GradeSheetCellViewModel[];
  filledCells: number;
  emptyCells: number;
  failureCount: number;
}

export interface GradeSheetViewModel {
  actorScopeMessage: string;
  scopeLabel: string;
  structureLabel: string;
  encodeStatusLabel: string;
  totalsReadonlyLabel: string;
  columns: GradeSheetColumnViewModel[];
  rows: GradeSheetRowViewModel[];
  totalStudents: number;
  totalEditableCells: number;
  totalFilledCells: number;
  totalEmptyCells: number;
  totalFailures: number;
}

export interface GradeSheetResponse extends DetailResponse<GradeSheetApiRow[]> {
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const authorizedGradeSheetActors: GradeSheetActorCode[] = [
  'ENSEIGNANT',
];

export const semestrialGradeSheetOrder = [
  'P1',
  'P2',
  'EX1',
  'TOTAL_S1',
  'P3',
  'P4',
  'EX2',
  'TOTAL_S2',
  'TOTAL_GENERAL',
] as const;

export const trimestrialGradeSheetOrder = [
  'P1',
  'P2',
  'EX1',
  'TOTAL_T1',
  'P3',
  'P4',
  'EX2',
  'TOTAL_T2',
  'P5',
  'P6',
  'EX3',
  'TOTAL_T3',
  'TOTAL_GENERAL',
] as const;
