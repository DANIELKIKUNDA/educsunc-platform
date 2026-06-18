import { ControleurTempsReelNotificationFuturHttp } from '../controllers';

// Ce fichier declare la facade HTTP du futur temps reel Notifications.

/** Cette classe regroupe la surface HTTP preparatoire du futur temps reel. */
export class FacadeTempsReelNotificationFuturHttp {
  /** Ce constructeur relie la facade au controller temps reel futur. */
  constructor(private readonly controleurTempsReelNotificationFuturHttp: ControleurTempsReelNotificationFuturHttp) {}

  /** Cette methode delegue la lecture des capacites temps reel futures. */
  public obtenirCapacites(...argumentsFonction: Parameters<ControleurTempsReelNotificationFuturHttp['obtenirCapacites']>) {
    return this.controleurTempsReelNotificationFuturHttp.obtenirCapacites(...argumentsFonction);
  }

  /** Cette methode delegue la publication de test temps reel. */
  public publierTest(...argumentsFonction: Parameters<ControleurTempsReelNotificationFuturHttp['publierTest']>) {
    return this.controleurTempsReelNotificationFuturHttp.publierTest(...argumentsFonction);
  }
}
