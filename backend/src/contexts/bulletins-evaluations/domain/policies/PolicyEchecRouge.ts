import { StyleAffichageCote } from '../value-objects/StyleAffichageCote';

// Cette policy determine si une cote doit etre marquee comme echec en rouge.
export class PolicyEchecRouge {
  // Cette methode retourne le style d'affichage adapte a la cote.
  public determinerStyle(cote: number | null | undefined, maximum: number): StyleAffichageCote {
    if (cote === undefined || cote === null) {
      return StyleAffichageCote.NON_APPLICABLE;
    }

    return cote < maximum / 2 ? StyleAffichageCote.ECHEC_ROUGE : StyleAffichageCote.NORMAL;
  }
}
