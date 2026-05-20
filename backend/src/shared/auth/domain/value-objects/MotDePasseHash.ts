import { ObjetValeur } from '../../../domain/ValueObject';

// Cet objet valeur represente un mot de passe deja hashe et jamais brut.
export class MotDePasseHash extends ObjetValeur<{ valeur: string }> {
  constructor(valeur: string) {
    const hash = String(valeur || '').trim();
    if (!hash) {
      throw new Error('Le hash du mot de passe est obligatoire.');
    }

    super({ valeur: hash });
  }

  // Cette methode retourne le hash tel qu'il doit etre persiste ou verifie.
  public obtenirValeur(): string {
    return this.proprietes.valeur;
  }
}
