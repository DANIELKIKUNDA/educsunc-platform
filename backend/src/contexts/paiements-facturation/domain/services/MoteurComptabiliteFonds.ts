import { CaisseJour } from '../aggregates/CaisseJour';
import { Money } from '../value-objects/Money';
import { OrigineAffectation } from '../value-objects/OrigineAffectation';

export class MoteurComptabiliteFonds {
  public calculerDisponibleReel(caisse: CaisseJour): Money {
    return caisse.obtenirDisponibleReel();
  }

  public calculerFondsAnticipesParOrigine(montants: Array<{ montant: Money; origine: OrigineAffectation }>): Money {
    const devise = montants[0]?.montant.obtenirDevise() ?? 'CDF';
    return montants
      .filter((ligne) => ligne.origine === OrigineAffectation.ANTICIPE || ligne.origine === OrigineAffectation.LISSAGE)
      .reduce((courant, ligne) => courant.additionner(ligne.montant), Money.zero(devise));
  }
}
