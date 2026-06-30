import type { DetailResponse, MoneyHttp } from './payment-history.model';

export type CashRegisterStatusCode = 'OUVERTE' | 'FERMEE';

export interface CashDayApiData {
  idCaisseJour: string;
  idEcole: string;
  date: string;
  totalEncaisse: MoneyHttp;
  totalCash: MoneyHttp;
  totalMobileMoney: MoneyHttp;
  totalParCaissier: Array<{
    idCaissier: string;
    total: MoneyHttp;
  }>;
  totalParTypeFrais: Array<{
    typeFrais: string;
    total: MoneyHttp;
  }>;
  totalFondsAnticipes: MoneyHttp;
  totalFondsConsommes: MoneyHttp;
  disponibleReel: MoneyHttp;
  statut: CashRegisterStatusCode;
}

export interface CashOpeningRequest {
  date: string;
}

export interface CashClosingRequest {
  idCaisseJour: string;
  montantPhysiqueDeclare?: {
    montant: number;
    devise: 'CDF';
  };
  observation?: string;
}

export interface CashDayViewModel {
  id: string;
  date: string;
  dateLabel: string;
  status: CashRegisterStatusCode;
  totalEncaisse: number;
  totalCash: number;
  totalMobileMoney: number;
  totalFondsAnticipes: number;
  totalFondsConsommes: number;
  disponibleReel: number;
  cashDeskLabel: string;
  totalsByCashier: Array<{
    cashierId: string;
    cashierLabel: string;
    total: number;
  }>;
  totalsByFeeType: Array<{
    feeType: string;
    total: number;
  }>;
}

export type CashDayResponse = DetailResponse<CashDayApiData>;
