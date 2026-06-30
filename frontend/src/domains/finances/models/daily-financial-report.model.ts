import type { DetailResponse, MoneyHttp } from './payment-history.model';

export type DailyFinancialReportActorCode =
  | 'CAISSIER'
  | 'ADMINISTRATEUR_ECOLE'
  | 'GESTIONNAIRE_ORGANISATION'
  | 'PROMOTEUR_ORGANISATION';

export interface DailyFinancialReportApiData {
  periode: string;
  totalEncaisse: MoneyHttp;
  totalConsomme: MoneyHttp;
  totalAnticipe: MoneyHttp;
  totalRestitue: MoneyHttp;
  totalAnnule: MoneyHttp;
}

export interface DailyFinancialReportViewModel {
  dateLabel: string;
  totalEncaisse: number;
  totalConsomme: number;
  totalAnticipe: number;
  totalRestitue: number;
  totalAnnule: number;
}

export type DailyFinancialReportResponse = DetailResponse<DailyFinancialReportApiData>;

export const authorizedDailyFinancialReportActors: DailyFinancialReportActorCode[] = [
  'CAISSIER',
  'ADMINISTRATEUR_ECOLE',
  'GESTIONNAIRE_ORGANISATION',
  'PROMOTEUR_ORGANISATION',
];
