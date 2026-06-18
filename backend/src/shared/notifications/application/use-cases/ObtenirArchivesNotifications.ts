import { PortLectureNotifications } from '../ports';
import { RequeteArchivesNotifications } from '../queries';
import { ModeleLectureArchivesNotifications } from '../read-models';

// Ce fichier declare le cas d'usage applicatif de lecture des archives Notifications.

/** Cette classe expose le point d'entree applicatif de lecture des archives. */
export class ObtenirArchivesNotifications {
  /** Ce constructeur relie le cas d'usage au port de lecture. */
  constructor(private readonly portLectureNotifications: PortLectureNotifications) {}

  /** Cette methode retourne les notifications archivees. */
  public async executer(requete: RequeteArchivesNotifications): Promise<ModeleLectureArchivesNotifications> {
    return this.portLectureNotifications.obtenirArchives(requete);
  }
}
