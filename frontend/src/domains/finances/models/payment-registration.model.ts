import type { DetailResponse, MoneyHttp, StudentDetailApiData } from './payment-history.model';
import type { StudentDueFeesApiData } from './student-financial-situation.model';

export type PaymentRegistrationActorCode =
  | 'CAISSIER'
  | 'ADMINISTRATEUR_ECOLE'
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_PRIMAIRE'
  | 'DIRECTEUR_MATERNELLE';

export type PaymentRegistrationModeCode = 'CASH' | 'MOBILE_MONEY' | 'BANQUE';
export type PaymentRegistrationTargetCode = 'STANDARD' | 'ARRIERE' | 'LIBRE' | 'ANTICIPE';

export interface PaymentRegistrationApiReceipt {
  idRecu: string;
  numeroRecu: string;
  idPaiement: string;
  idObligation: string;
  libelle: string;
  montant: MoneyHttp;
  montantEnLettres: string;
  dateEmission: string;
  statutRecu: string;
}

export interface PaymentRegistrationApiRepartition {
  idRepartition: string;
  idObligation: string;
  montantAffecte: MoneyHttp;
  ordreAffectation: number;
  origineAffectation: string;
}

export interface PaymentRegistrationApiData {
  idPaiement: string;
  montantTotal: MoneyHttp;
  modePaiement: PaymentRegistrationModeCode;
  typeFraisDeclare: string;
  statutPaiement: string;
  repartitions: PaymentRegistrationApiRepartition[];
  recus: PaymentRegistrationApiReceipt[];
  restitution?: {
    idRestitution: string;
    montant: MoneyHttp;
    raison: string;
  };
}

export interface PaymentRegistrationRequest {
  idEleve: string;
  typeFraisDeclare: string;
  montant: {
    montant: number;
    devise: 'CDF';
  };
  modePaiement: PaymentRegistrationModeCode;
  ciblePaiement?: PaymentRegistrationTargetCode;
  idempotencyKey: string;
}

export interface StudentPaymentObligationViewModel {
  id: string;
  typeFrais: string;
  libelle: string;
  montantExigible: number;
  paiementPartielAutorise: boolean;
}

export interface StudentPaymentProfileViewModel {
  id: string;
  matricule: string;
  fullName: string;
  sexe: string;
  classe: string;
  section: string;
  anneeScolaire: string;
}

export interface PaymentRegistrationReceiptViewModel {
  id: string;
  numeroRecu: string;
  libelle: string;
  montant: number;
  devise: string;
  montantEnLettres: string;
  dateEmission: string;
}

export interface PaymentRegistrationResultViewModel {
  idPaiement: string;
  montantTotal: number;
  devise: string;
  modePaiement: PaymentRegistrationModeCode;
  typeFraisDeclare: string;
  statutPaiement: string;
  receipts: PaymentRegistrationReceiptViewModel[];
  restitution?: {
    idRestitution: string;
    montant: number;
    devise: string;
    raison: string;
  };
}

export type PaymentRegistrationStudentResponse = DetailResponse<StudentDetailApiData>;
export type PaymentRegistrationDueFeesResponse = DetailResponse<StudentDueFeesApiData>;
export type PaymentRegistrationResponse = DetailResponse<PaymentRegistrationApiData>;

export const authorizedPaymentRegistrationActors: PaymentRegistrationActorCode[] = [
  'CAISSIER',
  'ADMINISTRATEUR_ECOLE',
  'PREFET_ETUDES',
  'DIRECTEUR_PRIMAIRE',
  'DIRECTEUR_MATERNELLE',
];

export const paymentRegistrationModeOptions: Array<{
  value: PaymentRegistrationModeCode;
  label: string;
}> = [
  { value: 'CASH', label: 'Especes' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'BANQUE', label: 'Virement / Banque' },
];
