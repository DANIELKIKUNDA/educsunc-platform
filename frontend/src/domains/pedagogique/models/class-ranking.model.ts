import type { DetailResponse } from '../../finances/models/payment-history.model';

export type ClassRankingActorCode =
  | 'TITULAIRE'
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_ETUDES';

export interface ClassRankingFilters {
  idAnneeScolaire: string;
  idClassePedagogique: string;
  codeColonne: string;
  anneeScolaireLabel?: string;
  classeLabel?: string;
  sectionLabel?: string;
}

export interface RankingLineApiData {
  idEleve: string;
  nomComplet: string;
  sexe: string;
  totalObtenu?: number;
  maximumGeneral?: number;
  pourcentage?: number;
  rang?: number;
  estNonClasse: boolean;
}

export interface ClassRankingApiData {
  idClassementColonneClasse: string;
  idClassePedagogique: string;
  idAnneeScolaire: string;
  codeColonne: string;
  lignes: RankingLineApiData[];
}

export interface RankingLineViewModel {
  idEleve: string;
  displayLabel: string;
  sexe: string;
  totalObtenu: string;
  maximumGeneral: string;
  pourcentage: string;
  rang: string;
  estNonClasse: boolean;
}

export interface ClassRankingViewModel {
  scopeLabel: string;
  activeColumnLabel: string;
  actorScopeMessage: string;
  lineCount: number;
  nonClassesCount: number;
  bestPercentage: string;
  lines: RankingLineViewModel[];
}

export type ClassRankingResponse = DetailResponse<ClassRankingApiData>;

export const authorizedClassRankingActors: ClassRankingActorCode[] = [
  'TITULAIRE',
  'PREFET_ETUDES',
  'DIRECTEUR_ETUDES',
];
