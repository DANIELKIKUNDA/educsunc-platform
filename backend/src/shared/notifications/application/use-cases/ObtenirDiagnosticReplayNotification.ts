import { PortLectureNotifications } from '../ports';
import { RequeteDiagnosticReplayNotification } from '../queries';
import { ModeleLectureDiagnosticReplayNotification } from '../read-models';

// Ce fichier declare le cas d'usage applicatif de diagnostic de rejeu.

/** Cette classe expose le point d'entree applicatif de diagnostic de rejeu. */
export class ObtenirDiagnosticReplayNotification {
  /** Ce constructeur relie le cas d'usage au port de lecture. */
  constructor(private readonly portLectureNotifications: PortLectureNotifications) {}

  /** Cette methode retourne la vue de diagnostic de rejeu. */
  public async executer(requete: RequeteDiagnosticReplayNotification): Promise<ModeleLectureDiagnosticReplayNotification> {
    return this.portLectureNotifications.obtenirDiagnosticReplay(requete);
  }
}
