import type { DetailResponse, MoneyHttp } from './payment-history.model';

export type SectionFinancialSummaryActorCode =
  | 'CAISSIER'
  | 'ADMINISTRATEUR_ECOLE'
  | 'GESTIONNAIRE_ORGANISATION'
  | 'PROMOTEUR_ORGANISATION'
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_PRIMAIRE'
  | 'DIRECTEUR_MATERNELLE';

export interface SectionFinancialSummaryFilters {
  idAnneeScolaire: string;
  idSectionScolaire: string;
  moisAnalyseJusqua?: string;
  typeFrais?: string;
  anneeScolaireLabel?: string;
  sectionLabel?: string;
}

export interface SectionFinancialSummaryApiRow {
  idClassePedagogique: string;
  classe: string;
  effectifTotal: number;
  elevesRedevables: number;
  elevesEnOrdre: number;
  elevesNonEnOrdre: number;
  montantAttendu: MoneyHttp;
  montantPaye: MoneyHttp;
  resteARecouvrer: MoneyHttp;
  tauxRecouvrement: number;
}

export interface SectionFinancialSummaryApiData {
  idOrganisation: string;
  idEcole: string;
  idAnneeScolaire: string;
  idSectionScolaire: string;
  moisAnalyseJusqua?: string;
  typeFrais?: string;
  lignes: SectionFinancialSummaryApiRow[];
  totalGeneralSection: {
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

export interface SectionFinancialSummaryRowViewModel {
  idClassePedagogique: string;
  classe: string;
  effectifTotal: number;
  redevables: number;
  enOrdre: number;
  nonEnOrdre: number;
  montantAttendu: number;
  montantPaye: number;
  resteARecouvrer: number;
  tauxRecouvrement: number;
}

export interface SectionFinancialSummaryViewModel {
  periodeLabel: string;
  scopeLabel: string;
  typeFraisLabel: string;
  rows: SectionFinancialSummaryRowViewModel[];
  totalGeneralSection: SectionFinancialSummaryRowViewModel;
}

export type SectionFinancialSummaryResponse = DetailResponse<SectionFinancialSummaryApiData>;

export const authorizedSectionFinancialSummaryActors: SectionFinancialSummaryActorCode[] = [
  'CAISSIER',
  'ADMINISTRATEUR_ECOLE',
  'GESTIONNAIRE_ORGANISATION',
  'PROMOTEUR_ORGANISATION',
  'PREFET_ETUDES',
  'DIRECTEUR_PRIMAIRE',
  'DIRECTEUR_MATERNELLE',
];
