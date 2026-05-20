import { ObjetValeur } from '../../../domain/ValueObject';

// Cet objet valeur represente le refresh token brut manipule avant hash.
export class RefreshTokenValue extends ObjetValeur<{ valeur: string }> {
  constructor(valeur: string) {
    const token = String(valeur || '').trim();
    if (!token) {
      throw new Error('Le refresh token est obligatoire.');
    }

    super({ valeur: token });
  }

  // Cette methode expose la valeur brute du refresh token.
  public obtenirValeur(): string {
    return this.proprietes.valeur;
  }
}
