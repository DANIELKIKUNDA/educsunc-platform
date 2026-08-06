import type { DetailResponse, MoneyHttp } from './payment-history.model';

export type AnticipatedFundsActorCode =
  | 'CAISSIER'
  | 'ADMINISTRATEUR_ECOLE'
  | 'GESTIONNAIRE_ORGANISATION'
  | 'PROMOTEUR_ORGANISATION'
  | 'ENSEIGNANT'
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_ETUDES'
  | 'DIRECTEUR_PRIMAIRE'
  | 'DIRECTEUR_MATERNELLE';

export interface AnticipatedFundsApiData {
  idEcole: string;
  dateDebut?: string;
  dateFin?: string;
  totalFondsAnticipes: MoneyHttp;
  lignes: Array<{
    origineAffectation: string;
    total: MoneyHttp;
  }>;
}

export interface AnticipatedFundsFilters {
  dateDebut?: string;
  dateFin?: string;
}

export interface AnticipatedFundsRowViewModel {
  id: string;
  origineAffectation: string;
  total: number;
  devise: string;
}

export interface AnticipatedFundsViewModel {
  totalDisponible: number;
  totalLignes: number;
  periodeLabel: string;
  rows: AnticipatedFundsRowViewModel[];
}

export type AnticipatedFundsResponse = DetailResponse<AnticipatedFundsApiData>;

export const authorizedAnticipatedFundsActors: AnticipatedFundsActorCode[] = [
  'CAISSIER',
  'ADMINISTRATEUR_ECOLE',
  'GESTIONNAIRE_ORGANISATION',
  'PROMOTEUR_ORGANISATION',
  'ENSEIGNANT',
  'PREFET_ETUDES',
  'DIRECTEUR_ETUDES',
  'DIRECTEUR_PRIMAIRE',
  'DIRECTEUR_MATERNELLE',
];
