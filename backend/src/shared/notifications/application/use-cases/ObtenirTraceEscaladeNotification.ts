import { PortLectureNotifications } from '../ports';
import { RequeteTraceEscaladeNotification } from '../queries';
import { ModeleLectureTraceEscaladeNotification } from '../read-models';

// Ce fichier declare le cas d'usage applicatif de trace d'escalade.

/** Cette classe expose le point d'entree applicatif de trace d'escalade. */
export class ObtenirTraceEscaladeNotification {
  /** Ce constructeur relie le cas d'usage au port de lecture. */
  constructor(private readonly portLectureNotifications: PortLectureNotifications) {}

  /** Cette methode retourne la trace projetee d'escalade. */
  public async executer(requete: RequeteTraceEscaladeNotification): Promise<ModeleLectureTraceEscaladeNotification> {
    return this.portLectureNotifications.obtenirTraceEscalade(requete);
  }
}
