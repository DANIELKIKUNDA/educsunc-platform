import type { Money } from '../../domain/value-objects/Money';

export interface PaiementsParCaissierLigneReadModel {
  idCaissier: string;
  total: Money;
}

export interface PaiementsParCaissierReadModel {
  idEcole: string;
  dateDebut?: string;
  dateFin?: string;
  lignes: ReadonlyArray<PaiementsParCaissierLigneReadModel>;
}
