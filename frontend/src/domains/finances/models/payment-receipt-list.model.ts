import type { DetailResponse, MoneyHttp, StudentDetailApiData } from './payment-history.model';

export interface PaymentReceiptListApiItem {
  idRecu: string;
  numeroRecu: string;
  idPaiement: string;
  idEleve: string;
  idCaissier: string;
  dateEmission: string;
  heureEmission: string;
  modePaiement: string;
  totalPaye: MoneyHttp;
  statutRecu: string;
}

export interface PaymentReceiptListApiData {
  idEcole: string;
  filtres: {
    idEleve?: string;
    numeroRecu?: string;
    dateDebut?: string;
    dateFin?: string;
  };
  recus: PaymentReceiptListApiItem[];
}

export interface PaymentReceiptListFilters {
  idEleve?: string;
  numeroRecu?: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface PaymentReceiptListItemViewModel {
  idRecu: string;
  numeroRecu: string;
  idPaiement: string;
  idEleve: string;
  eleveNom: string;
  dateEmission: string;
  heureEmission: string;
  modePaiement: string;
  totalPaye: number;
  devise: string;
  statutRecu: string;
}

export interface PaymentReceiptListViewModel {
  totalRecus: number;
  rows: PaymentReceiptListItemViewModel[];
  filtres: PaymentReceiptListFilters;
}

export type PaymentReceiptListResponse = DetailResponse<PaymentReceiptListApiData>;

export interface StudentDetailsIndex {
  [idEleve: string]: StudentDetailApiData;
}
