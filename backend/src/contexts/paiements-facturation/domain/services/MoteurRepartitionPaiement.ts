import { ObligationFinanciereEleve } from '../aggregates/ObligationFinanciereEleve';
import { RepartitionPaiement } from '../entities/RepartitionPaiement';
import { Money } from '../value-objects/Money';
import { OrigineAffectation } from '../value-objects/OrigineAffectation';

export class MoteurRepartitionPaiement {
  public repartir(idPaiement: string, montant: Money, obligations: ObligationFinanciereEleve[], origineAffectation: OrigineAffectation = OrigineAffectation.NORMAL): RepartitionPaiement[] {
    let restant = montant;
    const repartitions: RepartitionPaiement[] = [];

    obligations.forEach((obligation, index) => {
      if (restant.estZero() || obligation.estSoldee()) {
        return;
      }

      const montantAffecte = obligation.obtenirSolde().estSuperieurA(restant) ? restant : obligation.obtenirSolde();
      obligation.enregistrerPaiement(montantAffecte, origineAffectation);
      repartitions.push(new RepartitionPaiement({
        idRepartition: `${idPaiement}-${index + 1}`,
        idPaiement,
        idObligation: obligation.obtenirId(),
        montantAffecte,
        ordreAffectation: index + 1,
        origineAffectation,
      }));
      restant = restant.soustraire(montantAffecte);
    });

    return repartitions;
  }
}
