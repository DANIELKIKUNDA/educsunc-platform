import { ErreurPourcentageInvalide } from '../exceptions/ErreurPourcentageInvalide';

// Ce value object represente un pourcentage de bulletin compris entre 0 et 100.
export class PourcentageBulletin {
  private valeur: number;

  // Ce constructeur verifie les bornes du pourcentage.
  constructor(valeur: number) {
    this.valeur = PourcentageBulletin.valider(valeur);
  }

  // Cette methode expose la valeur numerique du pourcentage.
  public obtenirValeur(): number {
    return this.valeur;
  }

  // Cette methode retourne l'affichage officiel avec une decimale et le symbole pourcentage.
  public obtenirAffichageOfficiel(): string {
    return `${this.valeur.toFixed(1).replace('.', ',')} %`;
  }

  // Cette methode compare deux pourcentages.
  public estEgal(autre: PourcentageBulletin): boolean {
    return this.valeur === autre.obtenirValeur();
  }

  // Cette methode valide la borne metier du pourcentage.
  private static valider(valeur: number): number {
    if (!Number.isFinite(valeur) || valeur < 0 || valeur > 100) {
      throw new ErreurPourcentageInvalide();
    }

    return Number(valeur.toFixed(1));
  }
}
