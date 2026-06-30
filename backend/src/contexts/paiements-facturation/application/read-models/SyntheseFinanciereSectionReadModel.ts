import type { Money } from '../../domain/value-objects/Money';

export interface SyntheseFinanciereSectionLigneReadModel {
  idClassePedagogique: string;
  classe: string;
  effectifTotal: number;
  elevesRedevables: number;
  elevesEnOrdre: number;
  elevesNonEnOrdre: number;
  montantAttendu: Money;
  montantPaye: Money;
  resteARecouvrer: Money;
  tauxRecouvrement: number;
}

export interface SyntheseFinanciereSectionSituationReadModel {
  effectifTotal: number;
  elevesRedevables: number;
  elevesEnOrdre: number;
  elevesNonEnOrdre: number;
  montantAttendu: Money;
  montantPaye: Money;
  resteARecouvrer: Money;
  tauxRecouvrement: number;
}

export interface SyntheseFinanciereSectionReadModel {
  idOrganisation: string;
  idEcole: string;
  idAnneeScolaire: string;
  idSectionScolaire: string;
  moisAnalyseJusqua?: string;
  typeFrais?: string;
  lignes: ReadonlyArray<SyntheseFinanciereSectionLigneReadModel>;
  totalGeneralSection: SyntheseFinanciereSectionSituationReadModel;
}
