import { Money } from '../value-objects/Money';
import { MoisScolaire } from '../value-objects/MoisScolaire';

export class MoteurLissageFrais {
  public repartirEquitablement(montant: Money, moisSupports: MoisScolaire[]): Map<MoisScolaire, Money> {
    if (moisSupports.length === 0) {
      throw new Error('Le lissage exige au moins un mois support.');
    }

    const montantUnitaire = Math.floor(montant.obtenirMontant() / moisSupports.length);
    const reste = montant.obtenirMontant() % moisSupports.length;
    const repartition = new Map<MoisScolaire, Money>();

    moisSupports.forEach((mois, index) => {
      repartition.set(mois, new Money(montantUnitaire + (index < reste ? 1 : 0), montant.obtenirDevise()));
    });

    return repartition;
  }
}
