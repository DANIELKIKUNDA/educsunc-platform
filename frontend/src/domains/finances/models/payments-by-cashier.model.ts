import type { DetailResponse, MoneyHttp } from './payment-history.model';

export type CashierAnalyticsActorCode =
  | 'CAISSIER'
  | 'ADMINISTRATEUR_ECOLE'
  | 'GESTIONNAIRE_ORGANISATION'
  | 'PROMOTEUR_ORGANISATION';

export interface PaymentsByCashierApiData {
  idEcole: string;
  dateDebut?: string;
  dateFin?: string;
  lignes: Array<{
    idCaissier: string;
    total: MoneyHttp;
  }>;
}

export interface PaymentsByCashierFilters {
  dateDebut?: string;
  dateFin?: string;
}

export interface PaymentsByCashierRowViewModel {
  id: string;
  caissier: string;
  montantTotal: number;
  devise: string;
}

export interface PaymentsByCashierViewModel {
  periodeLabel: string;
  totalEncaisse: number;
  totalCaissiers: number;
  rows: PaymentsByCashierRowViewModel[];
}

export type PaymentsByCashierResponse = DetailResponse<PaymentsByCashierApiData>;

export const authorizedCashierAnalyticsActors: CashierAnalyticsActorCode[] = [
  'CAISSIER',
  'ADMINISTRATEUR_ECOLE',
  'GESTIONNAIRE_ORGANISATION',
  'PROMOTEUR_ORGANISATION',
];
