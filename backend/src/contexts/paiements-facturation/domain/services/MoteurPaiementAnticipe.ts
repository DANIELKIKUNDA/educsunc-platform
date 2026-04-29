import { ObligationFinanciereEleve } from '../aggregates/ObligationFinanciereEleve';
import { Money } from '../value-objects/Money';
import { OrigineAffectation } from '../value-objects/OrigineAffectation';

export class MoteurPaiementAnticipe {
  public affecter(montantAnticipe: Money, obligationsFutures: ObligationFinanciereEleve[]): Money {
    let restant = montantAnticipe;

    obligationsFutures.forEach((obligation) => {
      if (restant.estZero() || obligation.estSoldee()) {
        return;
      }

      const aAffecter = obligation.obtenirSolde().estSuperieurA(restant) ? restant : obligation.obtenirSolde();
      obligation.enregistrerPaiement(aAffecter, OrigineAffectation.ANTICIPE);
      restant = restant.soustraire(aAffecter);
    });

    return restant;
  }
}
