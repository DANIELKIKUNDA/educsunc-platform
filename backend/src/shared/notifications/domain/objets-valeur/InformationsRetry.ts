import { ObjetValeur } from '../../../domain/ValueObject';

/**
 * Cet objet-valeur represente l'etat logique du retry pour une notification.
 */
export class InformationsRetry extends ObjetValeur<{
  compteurRetry: number;
  maximumRetry: number;
  dernierEchec?: string;
}> {
  /**
   * Ce constructeur verifie que le compteur reste coherent avec la politique de retry.
   */
  constructor(compteurRetry: number, maximumRetry: number, dernierEchec?: string) {
    if (compteurRetry < 0 || maximumRetry < 0 || compteurRetry > maximumRetry) {
      throw new Error('Les informations de retry sont incoherentes.');
    }
    super({
      compteurRetry,
      maximumRetry,
      dernierEchec: InformationsRetry.nettoyer(dernierEchec),
    });
  }

  /** Cette methode expose le compteur de retry courant. */
  public obtenirCompteurRetry(): number { return this.proprietes.compteurRetry; }

  /** Cette methode expose le maximum autorise par la politique. */
  public obtenirMaximumRetry(): number { return this.proprietes.maximumRetry; }

  /** Cette methode cree une nouvelle version incremente du retry state. */
  public incrementer(dernierEchec?: string): InformationsRetry {
    return new InformationsRetry(
      this.proprietes.compteurRetry + 1,
      this.proprietes.maximumRetry,
      dernierEchec,
    );
  }

  /** Cette methode normalise les champs textuels optionnels. */
  private static nettoyer(valeur?: string): string | undefined {
    const propre = String(valeur ?? '').trim();
    return propre.length > 0 ? propre : undefined;
  }
}
