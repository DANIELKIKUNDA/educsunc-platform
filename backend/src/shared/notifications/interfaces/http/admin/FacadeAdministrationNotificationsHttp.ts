import { ControleurAdministrationNotificationsHttp } from '../controllers';

// Ce fichier declare la facade HTTP d'administration Notifications.

/** Cette classe regroupe la surface HTTP d'administration du module Notifications. */
export class FacadeAdministrationNotificationsHttp {
  /** Ce constructeur relie la facade au controller d'administration. */
  constructor(private readonly controleurAdministrationNotificationsHttp: ControleurAdministrationNotificationsHttp) {}

  /** Cette methode delegue la lecture des archives. */
  public obtenirArchives(...argumentsFonction: Parameters<ControleurAdministrationNotificationsHttp['obtenirArchives']>) {
    return this.controleurAdministrationNotificationsHttp.obtenirArchives(...argumentsFonction);
  }

  /** Cette methode delegue la lecture consolidee tenant-aware. */
  public obtenirVueTenant(...argumentsFonction: Parameters<ControleurAdministrationNotificationsHttp['obtenirVueTenant']>) {
    return this.controleurAdministrationNotificationsHttp.obtenirVueTenant(...argumentsFonction);
  }

  /** Cette methode delegue la lecture de trace d'escalade. */
  public obtenirTraceEscalade(...argumentsFonction: Parameters<ControleurAdministrationNotificationsHttp['obtenirTraceEscalade']>) {
    return this.controleurAdministrationNotificationsHttp.obtenirTraceEscalade(...argumentsFonction);
  }
}
