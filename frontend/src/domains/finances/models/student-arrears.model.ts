import type { DetailResponse, MoneyHttp, StudentDetailApiData } from './payment-history.model';
import type { StudentDebtApiData } from './student-financial-situation.model';

export type StudentArrearsActorCode =
  | 'CAISSIER'
  | 'ADMINISTRATEUR_ECOLE'
  | 'GESTIONNAIRE_ORGANISATION'
  | 'PROMOTEUR_ORGANISATION'
  | 'TITULAIRE'
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_ETUDES'
  | 'DIRECTEUR_PRIMAIRE'
  | 'DIRECTEUR_MATERNELLE';

export interface StudentArrearsApiData {
  idEleve: string;
  totalArrieres: MoneyHttp;
}

export interface StudentArrearRow {
  id: string;
  typeFrais: string;
  libelle: string;
  periode: string;
  montantInitial: number;
  montantPaye: number;
  montantRestant: number;
}

export interface StudentArrearsProfile {
  id: string;
  eleve: string;
  matricule: string;
  classe: string;
  section: string;
  totalArrieres: number;
  nombreLignes: number;
}

export interface StudentArrearsViewModel {
  profile: StudentArrearsProfile;
  rows: StudentArrearRow[];
}

export type StudentArrearsResponse = DetailResponse<StudentArrearsApiData>;
export type StudentDebtDetailResponse = DetailResponse<StudentDebtApiData>;
export type StudentArrearsStudentResponse = DetailResponse<StudentDetailApiData>;

export const authorizedStudentArrearsActors: StudentArrearsActorCode[] = [
  'CAISSIER',
  'ADMINISTRATEUR_ECOLE',
  'GESTIONNAIRE_ORGANISATION',
  'PROMOTEUR_ORGANISATION',
  'TITULAIRE',
  'PREFET_ETUDES',
  'DIRECTEUR_ETUDES',
  'DIRECTEUR_PRIMAIRE',
  'DIRECTEUR_MATERNELLE',
];
