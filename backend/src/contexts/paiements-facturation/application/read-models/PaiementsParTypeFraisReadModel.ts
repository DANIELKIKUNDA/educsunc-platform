import type { Money } from '../../domain/value-objects/Money';

export interface PaiementsParTypeFraisLigneReadModel {
  typeFrais: string;
  total: Money;
}

export interface PaiementsParTypeFraisReadModel {
  idEcole: string;
  dateDebut?: string;
  dateFin?: string;
  lignes: ReadonlyArray<PaiementsParTypeFraisLigneReadModel>;
}
