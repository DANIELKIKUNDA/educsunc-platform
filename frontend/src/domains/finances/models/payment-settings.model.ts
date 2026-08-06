import type { DetailResponse } from './payment-history.model';

export type PaymentSettingsActorCode = 'ADMIN_SYSTEME_ECOLE';

export type PaymentModeCode = 'CASH' | 'MOBILE_MONEY' | 'BANQUE';
export type PaymentArrearsPolicyCode =
  | 'BLOQUER_REINSCRIPTION'
  | 'AUTORISER_AVEC_SUIVI'
  | 'ARRIERE_D_ABORD'
  | 'ANNEE_ACTIVE_D_ABORD'
  | 'LIBRE';
export type PaymentSchoolMonthCode =
  | 'SEPTEMBRE'
  | 'OCTOBRE'
  | 'NOVEMBRE'
  | 'DECEMBRE'
  | 'JANVIER'
  | 'FEVRIER'
  | 'MARS'
  | 'AVRIL'
  | 'MAI'
  | 'JUIN';
export type PaymentFeeTypeCode =
  | 'FRAIS_SCOLAIRES'
  | 'FRAIS_ETAT'
  | 'FRAIS_TECHNIQUES'
  | 'FRAIS_ENROLEMENT_TENASOSP'
  | 'FRAIS_PARTICIPATION_TENASOSP'
  | 'FRAIS_ENROLEMENT_EXETAT'
  | 'FRAIS_PARTICIPATION_EXETAT'
  | 'FRAIS_BULLETIN'
  | 'FRAIS_MINERVAL'
  | 'FRAIS_INSCRIPTION'
  | 'AUTRE';
export type PaymentDelegatedPerceptionRoleCode =
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_PRIMAIRE'
  | 'DIRECTEUR_MATERNELLE';
export type PaymentDelegatedHistoryRoleCode =
  // Code de politique metier backend, distinct du role de session ENSEIGNANT.
  | 'TITULAIRE'
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_ETUDES'
  | 'DIRECTEUR_PRIMAIRE'
  | 'DIRECTEUR_MATERNELLE';
export type PaymentDelegatedExonerationRoleCode = 'SECRETAIRE';

export interface PaymentSettingsApiData {
  idParametresPaiementEcole: string;
  idEcole: string;
  paiementPartielAutorise: boolean;
  paiementPartielParTypeFrais?: Record<string, boolean>;
  perceptionDelegueeParTypeFrais?: Record<string, PaymentDelegatedPerceptionRoleCode[]>;
  consultationHistoriquePaiementsDeleguee?: PaymentDelegatedHistoryRoleCode[];
  exonerationDeleguee?: PaymentDelegatedExonerationRoleCode[];
  politiqueArrieres: PaymentArrearsPolicyCode;
  autoriserInscriptionAvecDette: boolean;
  bloquerRetraitDocumentsSiDette: boolean;
  appliquerFamilleNombreuse: boolean;
  nombreEnfantsSeuilFamilleNombreuse?: number;
  modesPaiementAutorises: PaymentModeCode[];
  moisObligatoireInscription?: PaymentSchoolMonthCode;
  exigerFraisInscription: boolean;
  actif: boolean;
}

export interface PaymentSettingsUpdateRequest {
  paiementPartielAutorise: boolean;
  paiementPartielParTypeFrais?: Record<string, boolean>;
  perceptionDelegueeParTypeFrais?: Record<string, PaymentDelegatedPerceptionRoleCode[]>;
  consultationHistoriquePaiementsDeleguee?: PaymentDelegatedHistoryRoleCode[];
  exonerationDeleguee?: PaymentDelegatedExonerationRoleCode[];
  politiqueArrieres: PaymentArrearsPolicyCode;
  autoriserInscriptionAvecDette: boolean;
  bloquerRetraitDocumentsSiDette: boolean;
  appliquerFamilleNombreuse: boolean;
  nombreEnfantsSeuilFamilleNombreuse?: number;
  modesPaiementAutorises: PaymentModeCode[];
  moisObligatoireInscription?: PaymentSchoolMonthCode;
  exigerFraisInscription: boolean;
}

export interface PaymentSettingsFormState {
  paiementPartielAutorise: boolean;
  paiementPartielParTypeFrais: Record<string, boolean>;
  perceptionDelegueeParTypeFrais: Record<string, PaymentDelegatedPerceptionRoleCode[]>;
  consultationHistoriquePaiementsDeleguee: PaymentDelegatedHistoryRoleCode[];
  exonerationDeleguee: PaymentDelegatedExonerationRoleCode[];
  politiqueArrieres: PaymentArrearsPolicyCode;
  autoriserInscriptionAvecDette: boolean;
  bloquerRetraitDocumentsSiDette: boolean;
  appliquerFamilleNombreuse: boolean;
  nombreEnfantsSeuilFamilleNombreuse: string;
  modesPaiementAutorises: PaymentModeCode[];
  moisObligatoireInscription: PaymentSchoolMonthCode | '';
  exigerFraisInscription: boolean;
}

export interface PaymentSettingsViewModel {
  id: string;
  ecoleId: string;
  actif: boolean;
  modesPaiementAutorises: PaymentModeCode[];
  politiqueArrieres: PaymentArrearsPolicyCode;
  paiementPartielAutorise: boolean;
  autoriserInscriptionAvecDette: boolean;
  bloquerRetraitDocumentsSiDette: boolean;
  appliquerFamilleNombreuse: boolean;
  nombreEnfantsSeuilFamilleNombreuse?: number;
  moisObligatoireInscription?: PaymentSchoolMonthCode;
  exigerFraisInscription: boolean;
  paiementPartielParTypeFrais: Record<string, boolean>;
  perceptionDelegueeParTypeFrais: Record<string, PaymentDelegatedPerceptionRoleCode[]>;
  consultationHistoriquePaiementsDeleguee: PaymentDelegatedHistoryRoleCode[];
  exonerationDeleguee: PaymentDelegatedExonerationRoleCode[];
}

export type PaymentSettingsResponse = DetailResponse<PaymentSettingsApiData | null>;

export const paymentModeOptions: Array<{ value: PaymentModeCode; label: string }> = [
  { value: 'CASH', label: 'Especes' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'BANQUE', label: 'Banque' },
];

export const paymentArrearsPolicyOptions: Array<{ value: PaymentArrearsPolicyCode; label: string }> = [
  { value: 'BLOQUER_REINSCRIPTION', label: 'Bloquer reinscription' },
  { value: 'AUTORISER_AVEC_SUIVI', label: 'Autoriser avec suivi' },
  { value: 'ARRIERE_D_ABORD', label: 'Arriere d abord' },
  { value: 'ANNEE_ACTIVE_D_ABORD', label: 'Annee active d abord' },
  { value: 'LIBRE', label: 'Libre' },
];

export const paymentSchoolMonthOptions: Array<{ value: PaymentSchoolMonthCode; label: string }> = [
  { value: 'SEPTEMBRE', label: 'Septembre' },
  { value: 'OCTOBRE', label: 'Octobre' },
  { value: 'NOVEMBRE', label: 'Novembre' },
  { value: 'DECEMBRE', label: 'Decembre' },
  { value: 'JANVIER', label: 'Janvier' },
  { value: 'FEVRIER', label: 'Fevrier' },
  { value: 'MARS', label: 'Mars' },
  { value: 'AVRIL', label: 'Avril' },
  { value: 'MAI', label: 'Mai' },
  { value: 'JUIN', label: 'Juin' },
];

export const paymentFeeTypeOptions: Array<{ value: PaymentFeeTypeCode; label: string }> = [
  { value: 'FRAIS_SCOLAIRES', label: 'Frais scolaires' },
  { value: 'FRAIS_ETAT', label: 'Frais Etat' },
  { value: 'FRAIS_TECHNIQUES', label: 'Frais techniques' },
  { value: 'FRAIS_ENROLEMENT_TENASOSP', label: 'Enrolement TENASOSP' },
  { value: 'FRAIS_PARTICIPATION_TENASOSP', label: 'Participation TENASOSP' },
  { value: 'FRAIS_ENROLEMENT_EXETAT', label: 'Enrolement EXETAT' },
  { value: 'FRAIS_PARTICIPATION_EXETAT', label: 'Participation EXETAT' },
  { value: 'FRAIS_BULLETIN', label: 'Frais bulletin' },
  { value: 'FRAIS_MINERVAL', label: 'Frais minerval' },
  { value: 'FRAIS_INSCRIPTION', label: 'Frais inscription' },
  { value: 'AUTRE', label: 'Autre' },
];

export const paymentDelegatedPerceptionRoleOptions: Array<{
  value: PaymentDelegatedPerceptionRoleCode;
  label: string;
}> = [
  { value: 'PREFET_ETUDES', label: 'Prefet des etudes' },
  { value: 'DIRECTEUR_PRIMAIRE', label: 'Directeur primaire' },
  { value: 'DIRECTEUR_MATERNELLE', label: 'Directeur maternelle' },
];

export const paymentDelegatedHistoryRoleOptions: Array<{
  value: PaymentDelegatedHistoryRoleCode;
  label: string;
}> = [
  { value: 'TITULAIRE', label: 'Titulaire' },
  { value: 'PREFET_ETUDES', label: 'Prefet des etudes' },
  { value: 'DIRECTEUR_ETUDES', label: 'Directeur des etudes' },
  { value: 'DIRECTEUR_PRIMAIRE', label: 'Directeur primaire' },
  { value: 'DIRECTEUR_MATERNELLE', label: 'Directeur maternelle' },
];

export const paymentDelegatedExonerationRoleOptions: Array<{
  value: PaymentDelegatedExonerationRoleCode;
  label: string;
}> = [
  { value: 'SECRETAIRE', label: 'Secretaire' },
];
