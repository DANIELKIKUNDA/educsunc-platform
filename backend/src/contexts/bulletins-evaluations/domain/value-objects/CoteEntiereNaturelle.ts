import { ErreurCoteDecimaleInterdite } from '../exceptions/ErreurCoteDecimaleInterdite';
import { ErreurCoteNegativeInterdite } from '../exceptions/ErreurCoteNegativeInterdite';

// Ce value object represente une cote entiere naturelle encodable dans le bulletin.
export class CoteEntiereNaturelle {
  private valeur: number;

  // Ce constructeur impose une cote entiere et non negative.
  constructor(valeur: number) {
    this.valeur = CoteEntiereNaturelle.valider(valeur);
  }

  // Cette methode expose la valeur brute de la cote.
  public obtenirValeur(): number {
    return this.valeur;
  }

  // Cette methode indique si la cote vaut zero.
  public estZero(): boolean {
    return this.valeur === 0;
  }

  // Cette methode valide la nature entiere et non negative de la cote.
  private static valider(valeur: number): number {
    if (!Number.isInteger(valeur)) {
      throw new ErreurCoteDecimaleInterdite();
    }

    if (valeur < 0) {
      throw new ErreurCoteNegativeInterdite();
    }

    return valeur;
  }
}
