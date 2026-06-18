import type { Money } from '../../domain/value-objects/Money';

export interface ArrieresEleveReadModel {
  idEleve: string;
  totalArrieres: Money;
}
