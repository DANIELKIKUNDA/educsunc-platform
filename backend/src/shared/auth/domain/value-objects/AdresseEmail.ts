import { ObjetValeur } from '../../../domain/ValueObject';

// Cet objet valeur encapsule un email normalise et valide.
export class AdresseEmail extends ObjetValeur<{ valeur: string }> {
  constructor(valeur: string) {
    const emailNormalise = AdresseEmail.normaliser(valeur);
    AdresseEmail.verifier(emailNormalise);
    super({ valeur: emailNormalise });
  }

  // Cette methode retourne l'email metier deja normalise.
  public obtenirValeur(): string {
    return this.proprietes.valeur;
  }

  // Cette methode normalise l'email avant stockage.
  public static normaliser(valeur: string): string {
    return String(valeur || '').trim().toLowerCase();
  }

  // Cette methode verifie le format fonctionnel d'un email.
  public static verifier(valeur: string): void {
    if (!valeur) {
      throw new Error('L email utilisateur est obligatoire.');
    }

    const motif = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!motif.test(valeur)) {
      throw new Error('Le format de l email utilisateur est invalide.');
    }
  }
}
