import { ErreurMaximumInvalide } from '../exceptions/ErreurMaximumInvalide';

// Ce value object represente le maximum officiel autorise pour une colonne de cote.
export class MaximumColonne {
  private valeur: number;

  // Ce constructeur verifie qu'un maximum strictement positif est fourni.
  constructor(valeur: number) {
    this.valeur = MaximumColonne.valider(valeur);
  }

  // Cette methode expose la valeur du maximum officiel.
  public obtenirValeur(): number {
    return this.valeur;
  }

  // Cette methode valide la borne positive du maximum.
  private static valider(valeur: number): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ErreurMaximumInvalide();
    }

    return valeur;
  }
}
