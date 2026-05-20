import { MotDePasseHash } from '../value-objects/MotDePasseHash';

// Cette policy rappelle qu'AUTH ne manipule jamais de mot de passe brut en domaine.
export class PolicyMotDePasseSecurise {
  public static verifier(hash: MotDePasseHash | string): void {
    const valeur = hash instanceof MotDePasseHash ? hash.obtenirValeur() : String(hash || '').trim();
    if (!valeur) {
      throw new Error('Le hash du mot de passe est obligatoire.');
    }
  }
}
