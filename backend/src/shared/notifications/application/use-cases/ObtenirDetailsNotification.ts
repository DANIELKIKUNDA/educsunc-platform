import { PortLectureNotifications } from '../ports';
import { RequeteDetailsNotification } from '../queries';
import { ModeleLectureDetailsNotification } from '../read-models';

// Ce fichier declare le cas d'usage applicatif de details de notification.

/** Cette classe expose le point d'entree applicatif de lecture detail. */
export class ObtenirDetailsNotification {
  /** Ce constructeur relie le cas d'usage au port de lecture. */
  constructor(private readonly portLectureNotifications: PortLectureNotifications) {}

  /** Cette methode retourne la projection detaillee d'une notification. */
  public async executer(requete: RequeteDetailsNotification): Promise<ModeleLectureDetailsNotification | null> {
    return this.portLectureNotifications.obtenirDetails(requete);
  }
}
