import { randomUUID } from 'node:crypto';

import { ValidationError } from '../../../../shared/exceptions/ValidationError';
import { ObjetValeur } from '../../../../shared/domain/ValueObject';

// Cet objet valeur encapsule les identifiants transversaux pour centraliser leur format et leur validation.
export abstract class IdentifiantUnique extends ObjetValeur<string> {
  protected readonly valeur: string;

  // Ce constructeur reutilise une valeur fournie ou genere un identifiant unique si necessaire.
  constructor(valeur?: string) {
    const valeurFinale = valeur ?? randomUUID();

    if (typeof valeurFinale !== 'string') {
      throw new ValidationError(
        "La valeur de l'identifiant doit etre une chaine de caracteres.",
        'IDENTIFIANT_UNIQUE_INVALIDE',
      );
    }

    const valeurNettoyee = valeurFinale.trim();

    if (valeurNettoyee.length === 0) {
      throw new ValidationError(
        "La valeur de l'identifiant ne peut pas etre vide.",
        'IDENTIFIANT_UNIQUE_VIDE',
      );
    }

    super(valeurNettoyee);
    this.valeur = valeurNettoyee;
  }

  // Cette methode retourne la valeur brute de l'identifiant encapsule.
  public obtenirValeur(): string {
    return this.valeur;
  }
}
