import { ObjetValeur } from '../../../domain/ValueObject';

/**
 * Cet objet-valeur represente les metadonnees complementaires conservees avec la notification.
 */
export class MetadonneesNotification extends ObjetValeur<{
  coutEstime?: number;
  impactQuota?: number;
  tags: string[];
  additionnelles: Record<string, unknown>;
}> {
  /**
   * Ce constructeur encapsule les metadonnees sans leur donner de comportement mutable.
   */
  constructor(coutEstime?: number, impactQuota?: number, tags: string[] = [], additionnelles: Record<string, unknown> = {}) {
    super({
      coutEstime,
      impactQuota,
      tags: [...tags],
      additionnelles: { ...additionnelles },
    });
  }

  /** Cette methode expose les metadonnees libres transportees avec la notification. */
  public obtenirAdditionnelles(): Record<string, unknown> { return { ...this.proprietes.additionnelles }; }
}
