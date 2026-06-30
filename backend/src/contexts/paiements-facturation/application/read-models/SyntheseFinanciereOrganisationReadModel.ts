import type { Money } from '../../domain/value-objects/Money';

export interface SyntheseFinanciereOrganisationLigneReadModel {
  idEcole: string;
  ecole: string;
  effectifTotal: number;
  elevesRedevables: number;
  elevesEnOrdre: number;
  elevesNonEnOrdre: number;
  montantAttendu: Money;
  montantPaye: Money;
  resteARecouvrer: Money;
  tauxRecouvrement: number;
}

export interface SyntheseFinanciereOrganisationSituationReadModel {
  effectifTotal: number;
  elevesRedevables: number;
  elevesEnOrdre: number;
  elevesNonEnOrdre: number;
  montantAttendu: Money;
  montantPaye: Money;
  resteARecouvrer: Money;
  tauxRecouvrement: number;
}

export interface SyntheseFinanciereOrganisationReadModel {
  idOrganisation: string;
  idAnneeScolaire: string;
  moisAnalyseJusqua?: string;
  typeFrais?: string;
  lignes: ReadonlyArray<SyntheseFinanciereOrganisationLigneReadModel>;
  totalGeneralOrganisation: SyntheseFinanciereOrganisationSituationReadModel;
}
