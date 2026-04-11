import { ObjetValeur } from '../../../../shared/domain/ValueObject';
import { ValidationError } from '../../../../shared/exceptions/ValidationError';

// Cet objet valeur represente la position d'une classe dans le parcours scolaire.
// Il sert a trier les classes entre elles, tandis que la regle d'unicite de cet ordre sera geree ailleurs dans le domaine ou l'application.
export class OrdreClasse extends ObjetValeur<number> {
  private readonly valeur: number;

  // Ce constructeur valide l'ordre de classe puis l'encapsule dans un objet valeur immuable.
  constructor(valeur: number) {
    if (!Number.isFinite(valeur)) {
      throw new ValidationError(
        "L'ordre de classe doit etre un nombre valide.",
        'ORDRE_CLASSE_INVALIDE',
      );
    }

    if (!Number.isInteger(valeur)) {
      throw new ValidationError(
        "L'ordre de classe doit etre un entier.",
        'ORDRE_CLASSE_NON_ENTIER',
      );
    }

    if (valeur <= 0) {
      throw new ValidationError(
        "L'ordre de classe doit etre strictement positif.",
        'ORDRE_CLASSE_NON_POSITIF',
      );
    }

    super(valeur);
    this.valeur = valeur;
  }

  // Cette methode retourne la valeur numerique encapsulee de l'ordre de classe.
  public obtenirValeur(): number {
    return this.valeur;
  }

  // Cette methode confirme que l'ordre encapsule reste dans un etat technique valide.
  public estValide(): boolean {
    return Number.isInteger(this.valeur) && this.valeur > 0;
  }
}
