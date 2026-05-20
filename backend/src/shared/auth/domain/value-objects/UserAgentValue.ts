import { ObjetValeur } from '../../../domain/ValueObject';

// Cet objet valeur encapsule le user-agent technique de la session.
export class UserAgentValue extends ObjetValeur<{ valeur: string }> {
  constructor(valeur: string) {
    const userAgent = String(valeur || '').trim();
    if (!userAgent) {
      throw new Error('Le user-agent est obligatoire.');
    }

    super({ valeur: userAgent });
  }

  // Cette methode retourne le user-agent transporte par le domaine.
  public obtenirValeur(): string {
    return this.proprietes.valeur;
  }
}
