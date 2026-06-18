import type { Money } from '../../domain/value-objects/Money';

export interface LigneFondsAnticipesReadModel {
  origineAffectation: string;
  total: Money;
}

export interface FondsAnticipesReadModel {
  idEcole: string;
  dateDebut?: string;
  dateFin?: string;
  totalFondsAnticipes: Money;
  lignes: LigneFondsAnticipesReadModel[];
}
