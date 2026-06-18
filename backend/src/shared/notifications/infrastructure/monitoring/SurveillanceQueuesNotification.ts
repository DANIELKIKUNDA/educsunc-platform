import { RegistreFilesNotifications } from '../queues';
import { VueSurveillanceFilesNotifications } from './TypesMonitoringNotification';

// Ce fichier observe l'etat technique des files du moteur Notifications.

/** Cette classe calcule un snapshot de supervision des files techniques. */
export class SurveillanceQueuesNotification {
  /** Ce constructeur relie la surveillance au registre memoire des files. */
  constructor(
    private readonly registreFilesNotifications: RegistreFilesNotifications,
    private readonly seuilSaturation = 100,
  ) {}

  /** Cette methode retourne une vue agrégée de l'etat des files. */
  public observer(): VueSurveillanceFilesNotifications {
    const totalDispatch = this.registreFilesNotifications.obtenirFile('DISPATCH').length;
    const totalRetry = this.registreFilesNotifications.obtenirFile('RETRY').length;
    const totalReplay = this.registreFilesNotifications.obtenirFile('REPLAY').length;
    const totalEscalade = this.registreFilesNotifications.obtenirFile('ESCALADE').length;
    const totalDeadLetter = this.registreFilesNotifications.deadLetters.length;
    const saturationDetectee =
      totalDispatch >= this.seuilSaturation ||
      totalRetry >= this.seuilSaturation ||
      totalReplay >= this.seuilSaturation ||
      totalEscalade >= this.seuilSaturation;

    return {
      totalDispatch,
      totalRetry,
      totalReplay,
      totalEscalade,
      totalDeadLetter,
      saturationDetectee,
    };
  }
}
