import { Money } from '../../domain/value-objects/Money';

export interface RapportFinancierReadModel {
  periode: string;
  totalEncaisse: Money;
  totalConsomme: Money;
  totalAnticipe: Money;
  totalRestitue: Money;
  totalAnnule: Money;
}
