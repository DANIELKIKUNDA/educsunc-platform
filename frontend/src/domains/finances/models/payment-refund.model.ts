import type { DetailResponse, FinanceApiContext, MoneyHttp } from './payment-history.model';

export type PaymentRefundActorCode =
  | 'CAISSIER'
  | 'ADMINISTRATEUR_ECOLE'
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_PRIMAIRE'
  | 'DIRECTEUR_MATERNELLE';

export interface PaymentRefundRequest {
  idPaiement: string;
  idEleve: string;
  effectuePar: string;
}

export interface PaymentRefundApiData {
  idRestitution: string;
  montant: MoneyHttp;
  raison: string;
}

export interface PaymentRefundViewModel {
  idRestitution: string;
  montant: number;
  devise: string;
  raison: string;
}

export type PaymentRefundResponse = DetailResponse<PaymentRefundApiData>;

export const authorizedPaymentRefundActors: PaymentRefundActorCode[] = [
  'CAISSIER',
  'ADMINISTRATEUR_ECOLE',
  'PREFET_ETUDES',
  'DIRECTEUR_PRIMAIRE',
  'DIRECTEUR_MATERNELLE',
];

export interface PaymentRefundCommandContext extends FinanceApiContext {
  utilisateurTechnique: string | null;
}
