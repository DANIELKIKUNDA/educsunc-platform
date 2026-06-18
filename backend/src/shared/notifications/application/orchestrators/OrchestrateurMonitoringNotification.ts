import { RequeteMonitoringNotifications } from '../queries';
import { PortLectureNotifications, PortMonitoringNotification } from '../ports';
import { ModeleLectureMonitoringNotifications } from '../read-models';

// Ce fichier orchestre la supervision et le monitoring applicatif Notifications.

/** Cette classe coordonne la lecture et l'emission de signaux de monitoring. */
export class OrchestrateurMonitoringNotification {
  /** Ce constructeur relie la lecture applicative au port de monitoring technique. */
  constructor(
    private readonly portLectureNotifications: PortLectureNotifications,
    private readonly portMonitoringNotification: PortMonitoringNotification,
  ) {}

  /** Cette methode retourne la vue de monitoring et emet un signal de consultation. */
  public async executer(requete: RequeteMonitoringNotifications): Promise<ModeleLectureMonitoringNotifications> {
    const modele = await this.portLectureNotifications.obtenirMonitoring(requete);
    await this.portMonitoringNotification.enregistrerSignal('notifications.monitoring.read', {
      total: modele.totalNotifications,
      echecs: modele.totalEnEchec,
    });
    return modele;
  }
}
