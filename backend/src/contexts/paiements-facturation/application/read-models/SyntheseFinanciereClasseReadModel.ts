import type { Money } from '../../domain/value-objects/Money';

export interface SyntheseFinanciereClasseLigneReadModel {
  code: string;
  libelle: string;
  ordre: number;
  moisScolaire: string;
  typeFrais?: string;
  effectifTotal: number;
  elevesRedevables: number;
  elevesEnOrdre: number;
  elevesNonEnOrdre: number;
  montantAttendu: Money;
  montantPaye: Money;
  resteARecouvrer: Money;
  tauxRecouvrement: number;
}

export interface SyntheseFinanciereClasseSituationReadModel {
  effectifTotal: number;
  elevesRedevables: number;
  elevesEnOrdre: number;
  elevesNonEnOrdre: number;
  montantAttendu: Money;
  montantPaye: Money;
  resteARecouvrer: Money;
  tauxRecouvrement: number;
}

export interface SyntheseFinanciereClasseReadModel {
  idOrganisation: string;
  idEcole: string;
  idAnneeScolaire: string;
  idClassePedagogique: string;
  moisAnalyseJusqua?: string;
  typeFrais?: string;
  lignes: ReadonlyArray<SyntheseFinanciereClasseLigneReadModel>;
  situationActuelle: SyntheseFinanciereClasseSituationReadModel;
}
