import type { DetailResponse, MoneyHttp } from './payment-history.model';

export type ClassFinancialSummaryActorCode =
  | 'CAISSIER'
  | 'ADMINISTRATEUR_ECOLE'
  | 'GESTIONNAIRE_ORGANISATION'
  | 'PROMOTEUR_ORGANISATION'
  | 'ENSEIGNANT'
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_ETUDES'
  | 'DIRECTEUR_PRIMAIRE'
  | 'DIRECTEUR_MATERNELLE';

export interface ClassFinancialSummaryFilters {
  idAnneeScolaire: string;
  idClassePedagogique: string;
  moisAnalyseJusqua?: string;
  typeFrais?: string;
  anneeScolaireLabel?: string;
  classeLabel?: string;
  sectionLabel?: string;
}

export interface ClassFinancialSummaryApiRow {
  code: string;
  libelle: string;
  ordre: number;
  moisScolaire: string;
  typeFrais?: string;
  effectifTotal: number;
  elevesRedevables: number;
  elevesEnOrdre: number;
  elevesNonEnOrdre: number;
  montantAttendu: MoneyHttp;
  montantPaye: MoneyHttp;
  resteARecouvrer: MoneyHttp;
  tauxRecouvrement: number;
}

export interface ClassFinancialSummaryApiData {
  idOrganisation: string;
  idEcole: string;
  idAnneeScolaire: string;
  idClassePedagogique: string;
  moisAnalyseJusqua?: string;
  typeFrais?: string;
  lignes: ClassFinancialSummaryApiRow[];
  situationActuelle: {
    effectifTotal: number;
    elevesRedevables: number;
    elevesEnOrdre: number;
    elevesNonEnOrdre: number;
    montantAttendu: MoneyHttp;
    montantPaye: MoneyHttp;
    resteARecouvrer: MoneyHttp;
    tauxRecouvrement: number;
  };
}

export interface ClassFinancialSummaryRowViewModel {
  id: string;
  mois: string;
  effectifTotal: number;
  redevables: number;
  enOrdre: number;
  nonEnOrdre: number;
  montantAttendu: number;
  montantPaye: number;
  resteARecouvrer: number;
  tauxRecouvrement: number;
}

export interface ClassFinancialSummaryViewModel {
  periodeLabel: string;
  scopeLabel: string;
  typeFraisLabel: string;
  rows: ClassFinancialSummaryRowViewModel[];
  situationActuelle: ClassFinancialSummaryRowViewModel;
}

export type ClassFinancialSummaryResponse = DetailResponse<ClassFinancialSummaryApiData>;

export const authorizedClassFinancialSummaryActors: ClassFinancialSummaryActorCode[] = [
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
