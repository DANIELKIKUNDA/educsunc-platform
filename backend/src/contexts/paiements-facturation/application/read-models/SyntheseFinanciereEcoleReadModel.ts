import type { Money } from '../../domain/value-objects/Money';

export interface SyntheseFinanciereEcoleLigneReadModel {
  idSectionScolaire: string;
  section: string;
  effectifTotal: number;
  elevesRedevables: number;
  elevesEnOrdre: number;
  elevesNonEnOrdre: number;
  montantAttendu: Money;
  montantPaye: Money;
  resteARecouvrer: Money;
  tauxRecouvrement: number;
}

export interface SyntheseFinanciereEcoleSituationReadModel {
  effectifTotal: number;
  elevesRedevables: number;
  elevesEnOrdre: number;
  elevesNonEnOrdre: number;
  montantAttendu: Money;
  montantPaye: Money;
  resteARecouvrer: Money;
  tauxRecouvrement: number;
}

export interface SyntheseFinanciereEcoleReadModel {
  idOrganisation: string;
  idEcole: string;
  idAnneeScolaire: string;
  moisAnalyseJusqua?: string;
  typeFrais?: string;
  lignes: ReadonlyArray<SyntheseFinanciereEcoleLigneReadModel>;
  totalGeneralEcole: SyntheseFinanciereEcoleSituationReadModel;
}
