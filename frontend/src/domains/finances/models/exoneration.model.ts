import type { DetailResponse, MoneyHttp } from './payment-history.model';

export type ExonerationActorCode =
  | 'ADMINISTRATEUR_ECOLE'
  | 'GESTIONNAIRE_ORGANISATION'
  | 'PROMOTEUR_ORGANISATION'
  | 'SECRETAIRE';

export type ExonerationTypeCode =
  | 'ENFANT_PROMOTEUR'
  | 'FAMILLE_NOMBREUSE'
  | 'CAS_SOCIAL'
  | 'PRISE_EN_CHARGE'
  | 'DECISION_ADMINISTRATIVE'
  | 'AUTRE';

export interface ExonerationApiData {
  idExoneration: string;
  idObligation: string;
  montantExonere: MoneyHttp;
  raison: string;
  statut: string;
}

export interface ExonerationGrantRequest {
  idEleve: string;
  idObligation: string;
  typeExoneration: ExonerationTypeCode;
  montantExonere: {
    montant: number;
    devise: 'CDF';
  };
  raison: string;
  validePar?: string;
}

export interface ExonerationCancelRequest {
  idExoneration: string;
}

export interface ExonerationResultViewModel {
  idExoneration: string;
  idObligation: string;
  montantExonere: number;
  raison: string;
  statut: string;
}

export type ExonerationResponse = DetailResponse<ExonerationApiData>;

export const authorizedExonerationActors: ExonerationActorCode[] = [
  'ADMINISTRATEUR_ECOLE',
  'GESTIONNAIRE_ORGANISATION',
  'PROMOTEUR_ORGANISATION',
  'SECRETAIRE',
];

export const exonerationTypeOptions: Array<{
  value: ExonerationTypeCode;
  label: string;
}> = [
  { value: 'CAS_SOCIAL', label: 'Cas social' },
  { value: 'PRISE_EN_CHARGE', label: 'Prise en charge' },
  { value: 'DECISION_ADMINISTRATIVE', label: 'Décision administrative' },
  { value: 'FAMILLE_NOMBREUSE', label: 'Famille nombreuse' },
  { value: 'ENFANT_PROMOTEUR', label: 'Enfant promoteur' },
  { value: 'AUTRE', label: 'Autre' },
];
