import { ObjetValeur } from '../../../../shared/domain/ValueObject';
import { ValidationError } from '../../../../shared/exceptions/ValidationError';

// Cet objet valeur represente le code officiel d'une option d'etude, par exemple pour des references administratives ou d'examen d'Etat.
// Il est modele comme un Value Object pour centraliser les validations, renforcer le typage et eviter la circulation d'un simple nombre brut.
export class CodeOption extends ObjetValeur<number> {
  private readonly valeur: number;

  // Ce constructeur valide le code d'option puis l'encapsule dans un objet valeur immuable.
  constructor(valeur: number) {
    if (!Number.isFinite(valeur)) {
      throw new ValidationError(
        "Le code de l'option doit etre un nombre valide.",
        'CODE_OPTION_INVALIDE',
      );
    }

    if (!Number.isInteger(valeur)) {
      throw new ValidationError(
        "Le code de l'option doit etre un entier.",
        'CODE_OPTION_NON_ENTIER',
      );
    }

    if (valeur <= 0) {
      throw new ValidationError(
        "Le code de l'option doit etre strictement positif.",
        'CODE_OPTION_NON_POSITIF',
      );
    }

    if (valeur > 999) {
      throw new ValidationError(
        "Le code de l'option ne peut pas depasser 999.",
        'CODE_OPTION_TROP_ELEVE',
      );
    }

    super(valeur);
    this.valeur = valeur;
  }

  // Cette methode retourne la valeur numerique encapsulee du code d'option.
  public obtenirValeur(): number {
    return this.valeur;
  }

  // Cette methode confirme que le code encapsule reste dans l'intervalle technique autorise.
  public estValide(): boolean {
    return Number.isInteger(this.valeur) && this.valeur > 0 && this.valeur <= 999;
  }
}
