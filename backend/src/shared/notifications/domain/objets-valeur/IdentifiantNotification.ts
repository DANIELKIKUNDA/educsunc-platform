import { ObjetValeur } from '../../../domain/ValueObject';

/**
 * Cet objet-valeur represente l'identifiant stable d'une notification.
 */
export class IdentifiantNotification extends ObjetValeur<{ valeur: string }> {
  /**
   * Ce constructeur valide et normalise la valeur d'identifiant.
   */
  constructor(valeur: string) {
    super({ valeur: IdentifiantNotification.valider(valeur) });
  }

  /** Cette methode expose la valeur textuelle de l'identifiant. */
  public obtenirValeur(): string { return this.proprietes.valeur; }

  /** Cette methode centralise la validation minimale d'un identifiant. */
  private static valider(valeur: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error('Un identifiant de notification est obligatoire.');
    }
    return valeur.trim();
  }
}
