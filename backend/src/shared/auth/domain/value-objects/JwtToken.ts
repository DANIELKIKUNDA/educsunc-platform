import { ObjetValeur } from '../../../domain/ValueObject';

// Cet objet valeur represente un JWT deja signe.
export class JwtToken extends ObjetValeur<{ valeur: string }> {
  constructor(valeur: string) {
    const token = String(valeur || '').trim();
    if (!token) {
      throw new Error('Le JWT est obligatoire.');
    }

    super({ valeur: token });
  }

  // Cette methode expose le jeton signe transporte par le domaine.
  public obtenirValeur(): string {
    return this.proprietes.valeur;
  }
}
