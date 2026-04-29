import { Money } from '../value-objects/Money';

// Cette policy protege le prix historique des obligations deja creees.
export class PolicyPrixHistorique {
  public verifier(montantHistorique: Money, montantRecalcule: Money): void {
    if (!montantHistorique.estEgal(montantRecalcule)) {
      throw new Error('Le prix historique d une obligation ne peut pas etre reecrit.');
    }
  }
}
