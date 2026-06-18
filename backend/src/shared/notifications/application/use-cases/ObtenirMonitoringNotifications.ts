import { OrchestrateurMonitoringNotification } from '../orchestrators';
import { RequeteMonitoringNotifications } from '../queries';
import { ModeleLectureMonitoringNotifications } from '../read-models';
import { ValidateurRequeteMonitoringNotifications } from '../validators';

// Ce fichier declare le cas d'usage applicatif de monitoring Notifications.

/** Cette classe expose le point d'entree applicatif de supervision Notifications. */
export class ObtenirMonitoringNotifications {
  /** Ce constructeur relie le cas d'usage a l'orchestrateur de monitoring. */
  constructor(
    private readonly orchestrateurMonitoringNotification: OrchestrateurMonitoringNotification,
    private readonly validateurRequeteMonitoringNotifications = new ValidateurRequeteMonitoringNotifications(),
  ) {}

  /** Cette methode retourne la vue de monitoring Notifications. */
  public async executer(requete: RequeteMonitoringNotifications): Promise<ModeleLectureMonitoringNotifications> {
    this.validateurRequeteMonitoringNotifications.valider(requete);
    return this.orchestrateurMonitoringNotification.executer(requete);
  }
}
