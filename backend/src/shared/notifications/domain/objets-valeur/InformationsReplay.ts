import { ObjetValeur } from '../../../domain/ValueObject';

/**
 * Cet objet-valeur represente l'etat logique du replay pour une notification.
 */
export class InformationsReplay extends ObjetValeur<{
  compteurReplay: number;
  derniereRaison?: string;
  dernierInitiateur?: string;
}> {
  /**
   * Ce constructeur encapsule l'historique resume du replay.
   */
  constructor(compteurReplay: number, derniereRaison?: string, dernierInitiateur?: string) {
    if (compteurReplay < 0) {
      throw new Error('Le compteur de replay ne peut pas etre negatif.');
    }
    super({
      compteurReplay,
      derniereRaison: InformationsReplay.nettoyer(derniereRaison),
      dernierInitiateur: InformationsReplay.nettoyer(dernierInitiateur),
    });
  }

  /** Cette methode cree une nouvelle version incremente de l'etat de replay. */
  public incrementer(raison?: string, initiateur?: string): InformationsReplay {
    return new InformationsReplay(
      this.proprietes.compteurReplay + 1,
      raison,
      initiateur,
    );
  }

  /** Cette methode expose le compteur courant de replay. */
  public obtenirCompteurReplay(): number { return this.proprietes.compteurReplay; }

  /** Cette methode normalise les champs textuels optionnels. */
  private static nettoyer(valeur?: string): string | undefined {
    const propre = String(valeur ?? '').trim();
    return propre.length > 0 ? propre : undefined;
  }
}
