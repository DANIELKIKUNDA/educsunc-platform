import { ControleurRetryNotificationHttp } from '../controllers';

// Ce fichier declare la facade HTTP de retry Notifications.

/** Cette classe regroupe la surface HTTP de retry du module Notifications. */
export class FacadeRetryNotificationsHttp {
  /** Ce constructeur relie la facade au controller de retry. */
  constructor(private readonly controleurRetryNotificationHttp: ControleurRetryNotificationHttp) {}

  /** Cette methode delegue le pilotage HTTP du retry. */
  public controler(...argumentsFonction: Parameters<ControleurRetryNotificationHttp['controler']>) {
    return this.controleurRetryNotificationHttp.controler(...argumentsFonction);
  }

  /** Cette methode delegue la lecture de l'historique HTTP de retry. */
  public obtenirHistorique(...argumentsFonction: Parameters<ControleurRetryNotificationHttp['obtenirHistorique']>) {
    return this.controleurRetryNotificationHttp.obtenirHistorique(...argumentsFonction);
  }
}
