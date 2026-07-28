import type { DetailResponse, MoneyHttp, StudentDetailApiData } from './payment-history.model';

export type StudentFinancialSituationActorCode =
  | 'CAISSIER'
  | 'ADMINISTRATEUR_ECOLE'
  | 'GESTIONNAIRE_ORGANISATION'
  | 'PROMOTEUR_ORGANISATION'
  | 'ENSEIGNANT'
  | 'PARENT'
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_ETUDES'
  | 'DIRECTEUR_PRIMAIRE'
  | 'DIRECTEUR_MATERNELLE';

export interface StudentDebtLineApiData {
  idObligation: string;
  typeFrais: string;
  referenceFrais: string;
  libelle: string;
  montantDuHistorique: MoneyHttp;
  montantPaye: MoneyHttp;
  montantExonere: MoneyHttp;
  solde: MoneyHttp;
  statut: string;
}

export interface StudentDebtYearApiData {
  idAnneeScolaire: string;
  statutAnnee: 'ACTIVE' | 'CLOTUREE';
  lignes: StudentDebtLineApiData[];
  totalDu: MoneyHttp;
  totalPaye: MoneyHttp;
  totalExonere: MoneyHttp;
  soldeRestant: MoneyHttp;
}

export interface StudentDebtApiData {
  idEleve: string;
  totalArrieres: MoneyHttp;
  totalAnneeActive: MoneyHttp;
  totalGlobal: MoneyHttp;
  dettesParAnnee: StudentDebtYearApiData[];
}

export interface StudentDueFeeApiData {
  typeFrais: string;
  libelle: string;
  montantAttendu: MoneyHttp;
  paiementPartielAutorise: boolean;
  resteAPayer: MoneyHttp;
}

export interface StudentDueFeesApiData {
  idEleve: string;
  fraisDisponibles: StudentDueFeeApiData[];
}

export interface StudentDebtObligation {
  id: string;
  typeFrais: string;
  libelle: string;
  periode: string;
  montantAttendu: number;
  montantPaye: number;
  reste: number;
  statut: 'EN_ORDRE' | 'PARTIEL' | 'IMPAYE';
  segment: 'EXIGIBLE' | 'ARRIERE' | 'SOLDE';
}

export interface StudentFinancialSituationProfile {
  id: string;
  matricule: string;
  fullName: string;
  classe: string;
  section: string;
  anneeScolaire: string;
  totalDette: number;
  totalExigible: number;
  totalArrieres: number;
  obligations: StudentDebtObligation[];
}

export interface StudentFinancialSituationViewModel {
  profile: StudentFinancialSituationProfile;
  exigibleObligations: StudentDebtObligation[];
}

export type StudentDebtResponse = DetailResponse<StudentDebtApiData>;
export type StudentDueFeesResponse = DetailResponse<StudentDueFeesApiData>;
export type StudentDetailResponse = DetailResponse<StudentDetailApiData>;
