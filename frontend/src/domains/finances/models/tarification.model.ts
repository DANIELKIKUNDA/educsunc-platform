import type { DetailResponse, MoneyHttp } from './payment-history.model';
import type {
  PaymentFeeTypeCode,
  PaymentSchoolMonthCode,
} from './payment-settings.model';

export type TarificationActorCode = 'ADMIN_SYSTEME_ECOLE';
export type TarificationCurrencyCode = 'CDF' | 'USD';
export type TarificationCategorieFraisEtatCode =
  | 'MATERNELLE'
  | 'PRIMAIRE'
  | 'SECONDAIRE_EB'
  | 'SECONDAIRE_GENERALE'
  | 'SECONDAIRE_TECHNIQUE';
export type TarificationCategorieTechniqueCode = 'GROUPE_1' | 'GROUPE_2';
export type TarificationTrancheFraisEtatCode = 'TRANCHE_1' | 'TRANCHE_2' | 'TRANCHE_3';

export interface TarificationGridApiData {
  idGrilleTarification: string;
  idEcole: string;
  idAnneeScolaire: string;
  typeFrais: PaymentFeeTypeCode;
  libelle: string;
  montant: MoneyHttp;
  section?: string;
  categorieFraisEtat?: TarificationCategorieFraisEtatCode;
  categorieTechnique?: TarificationCategorieTechniqueCode;
  estClasseTENASOSP?: boolean;
  estClasseEXETAT?: boolean;
  estClasseFinaliste?: boolean;
  moisScolaire?: PaymentSchoolMonthCode;
  trancheFraisEtat?: TarificationTrancheFraisEtatCode;
  actif: boolean;
  obligatoire: boolean;
  dateDebutValidite?: string;
  dateFinValidite?: string;
}

export interface TarificationListFilters {
  idAnneeScolaire: string;
  typeFrais?: PaymentFeeTypeCode;
  actif?: boolean;
}

export interface TarificationGridRequest {
  idAnneeScolaire: string;
  typeFrais: PaymentFeeTypeCode;
  libelle: string;
  montant: {
    montant: number;
    devise: TarificationCurrencyCode;
  };
  section?: string;
  categorieFraisEtat?: TarificationCategorieFraisEtatCode;
  categorieTechnique?: TarificationCategorieTechniqueCode;
  estClasseTENASOSP?: boolean;
  estClasseEXETAT?: boolean;
  estClasseFinaliste?: boolean;
  moisScolaire?: PaymentSchoolMonthCode;
  trancheFraisEtat?: TarificationTrancheFraisEtatCode;
  obligatoire: boolean;
  dateDebutValidite?: string;
  dateFinValidite?: string;
  actif?: boolean;
}

export interface TarificationGridDisableRequest {
  idAnneeScolaire: string;
}

export interface TarificationGridRow {
  id: string;
  libelle: string;
  typeFrais: PaymentFeeTypeCode;
  montant: number;
  devise: TarificationCurrencyCode;
  section: string;
  anneeScolaireId: string;
  statut: 'ACTIVE' | 'INACTIVE';
  regle: string;
  obligatoire: boolean;
  moisScolaire?: PaymentSchoolMonthCode;
  categorieFraisEtat?: TarificationCategorieFraisEtatCode;
  categorieTechnique?: TarificationCategorieTechniqueCode;
  trancheFraisEtat?: TarificationTrancheFraisEtatCode;
  estClasseTENASOSP: boolean;
  estClasseEXETAT: boolean;
  estClasseFinaliste: boolean;
  dateDebutValidite?: string;
  dateFinValidite?: string;
}

export interface TarificationFormState {
  id: string | null;
  idAnneeScolaire: string;
  typeFrais: PaymentFeeTypeCode;
  libelle: string;
  montant: string;
  devise: TarificationCurrencyCode;
  section: string;
  categorieFraisEtat: TarificationCategorieFraisEtatCode | '';
  categorieTechnique: TarificationCategorieTechniqueCode | '';
  estClasseTENASOSP: boolean;
  estClasseEXETAT: boolean;
  estClasseFinaliste: boolean;
  moisScolaire: PaymentSchoolMonthCode | '';
  trancheFraisEtat: TarificationTrancheFraisEtatCode | '';
  obligatoire: boolean;
  actif: boolean;
  dateDebutValidite: string;
  dateFinValidite: string;
}

export type TarificationListResponse = DetailResponse<TarificationGridApiData[]>;
export type TarificationDetailResponse = DetailResponse<TarificationGridApiData>;

export const tarificationFeeTypeOptions: Array<{ value: PaymentFeeTypeCode; label: string }> = [
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

export const tarificationCategorieFraisEtatOptions: Array<{
  value: TarificationCategorieFraisEtatCode;
  label: string;
}> = [
  { value: 'MATERNELLE', label: 'Maternelle' },
  { value: 'PRIMAIRE', label: 'Primaire' },
  { value: 'SECONDAIRE_EB', label: 'Secondaire EB' },
  { value: 'SECONDAIRE_GENERALE', label: 'Secondaire generale' },
  { value: 'SECONDAIRE_TECHNIQUE', label: 'Secondaire technique' },
];

export const tarificationCategorieTechniqueOptions: Array<{
  value: TarificationCategorieTechniqueCode;
  label: string;
}> = [
  { value: 'GROUPE_1', label: 'Groupe 1' },
  { value: 'GROUPE_2', label: 'Groupe 2' },
];

export const tarificationTrancheOptions: Array<{
  value: TarificationTrancheFraisEtatCode;
  label: string;
}> = [
  { value: 'TRANCHE_1', label: 'Tranche 1' },
  { value: 'TRANCHE_2', label: 'Tranche 2' },
  { value: 'TRANCHE_3', label: 'Tranche 3' },
];

export const tarificationCurrencyOptions: Array<{
  value: TarificationCurrencyCode;
  label: string;
}> = [
  { value: 'CDF', label: 'Franc congolais' },
  { value: 'USD', label: 'Dollar americain' },
];
