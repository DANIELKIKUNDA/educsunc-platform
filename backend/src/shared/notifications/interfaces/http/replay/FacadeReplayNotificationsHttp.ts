import { ControleurReplayNotificationHttp } from '../controllers';

// Ce fichier declare la facade HTTP de replay Notifications.

/** Cette classe regroupe la surface HTTP de replay du module Notifications. */
export class FacadeReplayNotificationsHttp {
  /** Ce constructeur relie la facade au controller de replay. */
  constructor(private readonly controleurReplayNotificationHttp: ControleurReplayNotificationHttp) {}

  /** Cette methode delegue le rejeu HTTP. */
  public rejouer(...argumentsFonction: Parameters<ControleurReplayNotificationHttp['rejouer']>) {
    return this.controleurReplayNotificationHttp.rejouer(...argumentsFonction);
  }

  /** Cette methode delegue la lecture du diagnostic de rejeu. */
  public obtenirDiagnostic(...argumentsFonction: Parameters<ControleurReplayNotificationHttp['obtenirDiagnostic']>) {
    return this.controleurReplayNotificationHttp.obtenirDiagnostic(...argumentsFonction);
  }
}
