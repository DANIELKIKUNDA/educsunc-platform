import { PortLectureNotifications } from '../ports';
import { RequeteHistoriqueRetriesNotification } from '../queries';
import { ModeleLectureHistoriqueRetriesNotification } from '../read-models';

// Ce fichier declare le cas d'usage applicatif d'historique de retries.

/** Cette classe expose le point d'entree applicatif de lecture des retries. */
export class ObtenirHistoriqueRetriesNotification {
  /** Ce constructeur relie le cas d'usage au port de lecture. */
  constructor(private readonly portLectureNotifications: PortLectureNotifications) {}

  /** Cette methode retourne l'historique de retry d'une notification. */
  public async executer(requete: RequeteHistoriqueRetriesNotification): Promise<ModeleLectureHistoriqueRetriesNotification> {
    return this.portLectureNotifications.obtenirHistoriqueRetries(requete);
  }
}
