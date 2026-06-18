import type { EvenementDiffusable } from '../entities';

export class SpecificationEvenementDiffusable {
  public estSatisfaitePar(evenement: EvenementDiffusable): boolean {
    return evenement.estAutorise();
  }
}
