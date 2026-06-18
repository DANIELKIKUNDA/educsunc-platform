import { PortLectureNotifications } from '../ports';
import { RequeteDeadLettersNotifications } from '../queries';
import { ModeleLectureDeadLettersNotifications } from '../read-models';

// Ce fichier declare le cas d'usage applicatif de lecture des dead letters.

/** Cette classe expose le point d'entree applicatif de lecture des dead letters. */
export class ObtenirDeadLettersNotifications {
  /** Ce constructeur relie le cas d'usage au port de lecture. */
  constructor(private readonly portLectureNotifications: PortLectureNotifications) {}

  /** Cette methode retourne les dead letters Notifications. */
  public async executer(requete: RequeteDeadLettersNotifications): Promise<ModeleLectureDeadLettersNotifications> {
    return this.portLectureNotifications.obtenirDeadLetters(requete);
  }
}
