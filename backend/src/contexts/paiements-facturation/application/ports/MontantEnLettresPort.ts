import { Money } from '../../domain/value-objects/Money';

export interface MontantEnLettresPort {
  convertir(montant: Money): string;
}
