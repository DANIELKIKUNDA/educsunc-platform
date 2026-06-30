import type { DetailResponse } from '../../finances/models/payment-history.model';

export type ClassStatisticsActorCode =
  | 'TITULAIRE'
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_ETUDES'
  | 'DIRECTEUR_DISCIPLINE';

export interface ClassStatisticsFilters {
  idAnneeScolaire: string;
  idClassePedagogique: string;
  codeColonne: string;
  anneeScolaireLabel?: string;
  classeLabel?: string;
  sectionLabel?: string;
}

export interface ClassStatisticsApiData {
  inscritsGarcons: number;
  inscritsFilles: number;
  inscritsTotal: number;
  participantsGarcons: number;
  participantsFilles: number;
  participantsTotal: number;
  classesGarcons: number;
  classesFilles: number;
  classesTotal: number;
  nonClassesGarcons: number;
  nonClassesFilles: number;
  nonClassesTotal: number;
  abandonsGarcons: number;
  abandonsFilles: number;
  abandonsTotal: number;
  reussitesGarcons: number;
  reussitesFilles: number;
  reussitesTotal: number;
  echecsGarcons: number;
  echecsFilles: number;
  echecsTotal: number;
  tauxParticipation: number;
  tauxReussite: number;
  tauxEchec: number;
  tauxAbandon: number;
}

export interface ClassStatisticsMetricViewModel {
  code: string;
  label: string;
  garcons: string;
  filles: string;
  total: string;
}

export interface ClassStatisticsViewModel {
  scopeLabel: string;
  activeColumnLabel: string;
  actorScopeMessage: string;
  metrics: ClassStatisticsMetricViewModel[];
  tauxParticipation: string;
  tauxReussite: string;
  tauxEchec: string;
  tauxAbandon: string;
}

export type ClassStatisticsResponse = DetailResponse<ClassStatisticsApiData>;

export const authorizedClassStatisticsActors: ClassStatisticsActorCode[] = [
  'TITULAIRE',
  'PREFET_ETUDES',
  'DIRECTEUR_ETUDES',
  'DIRECTEUR_DISCIPLINE',
];
