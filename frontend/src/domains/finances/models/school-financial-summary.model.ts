import type { DetailResponse, MoneyHttp } from './payment-history.model';

export type SchoolFinancialSummaryActorCode =
  | 'CAISSIER'
  | 'ADMINISTRATEUR_ECOLE'
  | 'GESTIONNAIRE_ORGANISATION'
  | 'PROMOTEUR_ORGANISATION';

export interface SchoolFinancialSummaryFilters {
  idAnneeScolaire: string;
  moisAnalyseJusqua?: string;
  typeFrais?: string;
  anneeScolaireLabel?: string;
  ecoleLabel?: string;
}

export interface SchoolFinancialSummaryApiRow {
  idSectionScolaire: string;
  section: string;
  effectifTotal: number;
  elevesRedevables: number;
  elevesEnOrdre: number;
  elevesNonEnOrdre: number;
  montantAttendu: MoneyHttp;
  montantPaye: MoneyHttp;
  resteARecouvrer: MoneyHttp;
  tauxRecouvrement: number;
}

export interface SchoolFinancialSummaryApiData {
  idOrganisation: string;
  idEcole: string;
  idAnneeScolaire: string;
  moisAnalyseJusqua?: string;
  typeFrais?: string;
  lignes: SchoolFinancialSummaryApiRow[];
  totalGeneralEcole: {
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

export interface SchoolFinancialSummaryRowViewModel {
  idSectionScolaire: string;
  section: string;
  effectifTotal: number;
  redevables: number;
  enOrdre: number;
  nonEnOrdre: number;
  montantAttendu: number;
  montantPaye: number;
  resteARecouvrer: number;
  tauxRecouvrement: number;
}

export interface SchoolFinancialSummaryViewModel {
  periodeLabel: string;
  scopeLabel: string;
  typeFraisLabel: string;
  rows: SchoolFinancialSummaryRowViewModel[];
  totalGeneralEcole: SchoolFinancialSummaryRowViewModel;
}

export type SchoolFinancialSummaryResponse = DetailResponse<SchoolFinancialSummaryApiData>;

export const authorizedSchoolFinancialSummaryActors: SchoolFinancialSummaryActorCode[] = [
  'CAISSIER',
  'ADMINISTRATEUR_ECOLE',
  'GESTIONNAIRE_ORGANISATION',
  'PROMOTEUR_ORGANISATION',
];
