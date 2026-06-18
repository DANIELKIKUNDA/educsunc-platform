import { ControleurMonitoringNotificationsHttp } from '../controllers';

// Ce fichier declare la facade HTTP de monitoring Notifications.

/** Cette classe regroupe la surface HTTP de monitoring du module Notifications. */
export class FacadeMonitoringNotificationsHttp {
  /** Ce constructeur relie la facade au controller de monitoring. */
  constructor(private readonly controleurMonitoringNotificationsHttp: ControleurMonitoringNotificationsHttp) {}

  /** Cette methode delegue la lecture de monitoring. */
  public obtenirMonitoring(...argumentsFonction: Parameters<ControleurMonitoringNotificationsHttp['obtenirMonitoring']>) {
    return this.controleurMonitoringNotificationsHttp.obtenirMonitoring(...argumentsFonction);
  }

  /** Cette methode delegue la lecture des dead letters. */
  public obtenirDeadLetters(...argumentsFonction: Parameters<ControleurMonitoringNotificationsHttp['obtenirDeadLetters']>) {
    return this.controleurMonitoringNotificationsHttp.obtenirDeadLetters(...argumentsFonction);
  }
}
