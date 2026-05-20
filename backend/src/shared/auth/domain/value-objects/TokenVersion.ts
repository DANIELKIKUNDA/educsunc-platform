import { ObjetValeur } from '../../../domain/ValueObject';

// Cet objet valeur represente la version logique des jetons d'un utilisateur.
export class TokenVersion extends ObjetValeur<{ valeur: number }> {
  constructor(valeur: number) {
    if (!Number.isInteger(valeur) || valeur < 0) {
      throw new Error('La tokenVersion doit etre un entier superieur ou egal a zero.');
    }

    super({ valeur });
  }

  // Cette methode retourne la version numerique actuelle.
  public obtenirValeur(): number {
    return this.proprietes.valeur;
  }

  // Cette methode produit la version suivante a utiliser apres invalidation.
  public incrementer(): TokenVersion {
    return new TokenVersion(this.proprietes.valeur + 1);
  }
}
