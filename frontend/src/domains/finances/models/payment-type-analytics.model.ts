import type { DetailResponse, MoneyHttp } from './payment-history.model';

export type PaymentAnalyticsActorCode =
  | 'CAISSIER'
  | 'ADMINISTRATEUR_ECOLE'
  | 'GESTIONNAIRE_ORGANISATION'
  | 'PROMOTEUR_ORGANISATION'
  | 'ENSEIGNANT'
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_ETUDES'
  | 'DIRECTEUR_PRIMAIRE'
  | 'DIRECTEUR_MATERNELLE';

export interface PaymentTypeAnalyticsApiData {
  idEcole: string;
  dateDebut?: string;
  dateFin?: string;
  lignes: Array<{
    typeFrais: string;
    total: MoneyHttp;
  }>;
}

export interface PaymentTypeAnalyticsFilters {
  dateDebut?: string;
  dateFin?: string;
}

export interface PaymentTypeAnalyticsRowViewModel {
  id: string;
  typeFrais: string;
  montantTotal: number;
  devise: string;
  perimetre: string;
}

export interface PaymentTypeAnalyticsViewModel {
  periodeLabel: string;
  totalEncaisse: number;
  typesActifs: number;
  rows: PaymentTypeAnalyticsRowViewModel[];
}

export type PaymentTypeAnalyticsResponse = DetailResponse<PaymentTypeAnalyticsApiData>;

export const authorizedPaymentAnalyticsActors: PaymentAnalyticsActorCode[] = [
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
