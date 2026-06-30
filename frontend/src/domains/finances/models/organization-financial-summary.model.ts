import type { DetailResponse, MoneyHttp } from './payment-history.model';

export type OrganizationFinancialSummaryActorCode =
  | 'GESTIONNAIRE_ORGANISATION'
  | 'PROMOTEUR_ORGANISATION';

export interface OrganizationFinancialSummaryFilters {
  idAnneeScolaire: string;
  moisAnalyseJusqua?: string;
  typeFrais?: string;
  anneeScolaireLabel?: string;
  organisationLabel?: string;
}

export interface OrganizationFinancialSummaryApiRow {
  idEcole: string;
  ecole: string;
  effectifTotal: number;
  elevesRedevables: number;
  elevesEnOrdre: number;
  elevesNonEnOrdre: number;
  montantAttendu: MoneyHttp;
  montantPaye: MoneyHttp;
  resteARecouvrer: MoneyHttp;
  tauxRecouvrement: number;
}

export interface OrganizationFinancialSummaryApiData {
  idOrganisation: string;
  idAnneeScolaire: string;
  moisAnalyseJusqua?: string;
  typeFrais?: string;
  lignes: OrganizationFinancialSummaryApiRow[];
  totalGeneralOrganisation: {
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

export interface OrganizationFinancialSummaryRowViewModel {
  idEcole: string;
  ecole: string;
  effectifTotal: number;
  redevables: number;
  enOrdre: number;
  nonEnOrdre: number;
  montantAttendu: number;
  montantPaye: number;
  resteARecouvrer: number;
  tauxRecouvrement: number;
}

export interface OrganizationFinancialSummaryViewModel {
  periodeLabel: string;
  scopeLabel: string;
  typeFraisLabel: string;
  rows: OrganizationFinancialSummaryRowViewModel[];
  totalGeneralOrganisation: OrganizationFinancialSummaryRowViewModel;
}

export type OrganizationFinancialSummaryResponse = DetailResponse<OrganizationFinancialSummaryApiData>;

export const authorizedOrganizationFinancialSummaryActors: OrganizationFinancialSummaryActorCode[] = [
  'GESTIONNAIRE_ORGANISATION',
  'PROMOTEUR_ORGANISATION',
];
