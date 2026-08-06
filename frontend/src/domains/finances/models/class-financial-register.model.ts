import type { DetailResponse } from './payment-history.model';

export type ClassFinancialRegisterActorCode =
  | 'CAISSIER'
  | 'ADMINISTRATEUR_ECOLE'
  | 'GESTIONNAIRE_ORGANISATION'
  | 'PROMOTEUR_ORGANISATION'
  | 'ENSEIGNANT'
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_ETUDES'
  | 'DIRECTEUR_PRIMAIRE'
  | 'DIRECTEUR_MATERNELLE';

export interface ClassFinancialRegisterFilters {
  idAnneeScolaire: string;
  idClassePedagogique: string;
  moisAnalyseJusqua?: string;
  anneeScolaireLabel?: string;
  classeLabel?: string;
  sectionLabel?: string;
}

export interface ClassFinancialRegisterApiCell {
  colonneCode: string;
  montantAttendu: number;
  montantPaye: number;
  montantExonere: number;
  resteARecouvrer: number;
  estRedevable: boolean;
  estEnOrdre: boolean;
  statutAffiche?: string;
}

export interface ClassFinancialRegisterApiColumn {
  code: string;
  type: 'MOIS' | 'TRANCHE_ETAT' | 'INSCRIPTION' | 'SITUATION_FINANCIERE';
  libelle: string;
  ordre: number;
  moisScolaire?: string;
  trancheFraisEtat?: number;
  typeFrais?: string;
}

export interface ClassFinancialRegisterApiRow {
  numeroOrdre: number;
  idEleve: string;
  matricule: string;
  nom: string;
  postNom: string;
  prenom?: string;
  sexe: string;
  dateInscription: string;
  statutScolaire: string;
  cellules: ClassFinancialRegisterApiCell[];
  situationFinanciere: {
    totalAttendu: number;
    totalPaye: number;
    totalExonere: number;
    totalReste: number;
    estEnOrdre: boolean;
  };
}

export interface ClassFinancialRegisterApiStatistic {
  colonneCode: string;
  elevesRedevables: number;
  montantAttendu: number;
  montantPaye: number;
  resteARecouvrer: number;
  elevesEnOrdre: number;
  elevesNonEnOrdre: number;
  tauxRecouvrement: number;
}

export interface ClassFinancialRegisterApiData {
  idOrganisation: string;
  idEcole: string;
  idAnneeScolaire: string;
  idClassePedagogique: string;
  moisAnalyseJusqua?: string;
  colonnes: ClassFinancialRegisterApiColumn[];
  lignes: ClassFinancialRegisterApiRow[];
  statistiquesParColonne: ClassFinancialRegisterApiStatistic[];
}

export interface ClassFinancialRegisterColumnViewModel {
  code: string;
  type: ClassFinancialRegisterApiColumn['type'];
  libelle: string;
  shortLabel: string;
  ordre: number;
  isSituation: boolean;
}

export interface ClassFinancialRegisterCellViewModel {
  colonneCode: string;
  montantAttendu: number;
  montantPaye: number;
  montantExonere: number;
  resteARecouvrer: number;
  estRedevable: boolean;
  estEnOrdre: boolean;
  statutAffiche: string;
}

export interface ClassFinancialRegisterRowViewModel {
  id: string;
  numeroOrdre: number;
  matricule: string;
  fullName: string;
  nom: string;
  postNom: string;
  prenom: string;
  sexe: string;
  dateInscription: string;
  statutScolaire: string;
  cells: ClassFinancialRegisterCellViewModel[];
  totalAttendu: number;
  totalPaye: number;
  totalExonere: number;
  totalReste: number;
  estEnOrdre: boolean;
}

export interface ClassFinancialRegisterStatisticRowViewModel {
  metricCode: 'redevables' | 'attendu' | 'paye' | 'reste' | 'en-ordre' | 'non-en-ordre' | 'taux';
  metricLabel: string;
  values: Record<string, string>;
}

export interface ClassFinancialRegisterViewModel {
  periodeLabel: string;
  scopeLabel: string;
  columns: ClassFinancialRegisterColumnViewModel[];
  rows: ClassFinancialRegisterRowViewModel[];
  statisticRows: ClassFinancialRegisterStatisticRowViewModel[];
  totalEleves: number;
  totalRedevablesActuels: number;
  totalAttenduActuel: number;
  totalPayeActuel: number;
  totalResteActuel: number;
}

export type ClassFinancialRegisterResponse = DetailResponse<ClassFinancialRegisterApiData>;

export const authorizedClassFinancialRegisterActors: ClassFinancialRegisterActorCode[] = [
  'CAISSIER',
  'ADMINISTRATEUR_ECOLE',
  'GESTIONNAIRE_ORGANISATION',
  'PROMOTEUR_ORGANISATION',
  'ENSEIGNANT',
  'PREFET_ETUDES',
  'DIRECTEUR_ETUDES',
  'DIRECTEUR_PRIMAIRE',
  'DIRECTEUR_MATERNELLE',
];
