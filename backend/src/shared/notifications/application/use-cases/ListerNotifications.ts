import { PortLectureNotifications } from '../ports';
import { RequeteListerNotifications } from '../queries';
import { ModeleLectureListeNotifications } from '../read-models';
import { ValidateurRequeteListeNotifications } from '../validators';

// Ce fichier declare le cas d'usage applicatif de liste de notifications.

/** Cette classe expose le point d'entree applicatif de lecture liste. */
export class ListerNotifications {
  /** Ce constructeur relie le cas d'usage au port de lecture. */
  constructor(
    private readonly portLectureNotifications: PortLectureNotifications,
    private readonly validateurRequeteListeNotifications = new ValidateurRequeteListeNotifications(),
  ) {}

  /** Cette methode retourne la liste paginee de notifications. */
  public async executer(requete: RequeteListerNotifications): Promise<ModeleLectureListeNotifications> {
    this.validateurRequeteListeNotifications.valider(requete);
    return this.portLectureNotifications.lister(requete);
  }
}
