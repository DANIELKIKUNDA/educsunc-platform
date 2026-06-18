import { PortLectureNotifications } from '../ports';
import { RequeteChronologieNotification } from '../queries';
import { ModeleLectureChronologieNotification } from '../read-models';
import { ValidateurCoherenceChronologieNotification, ValidateurRequeteChronologieNotification } from '../validators';

// Ce fichier declare le cas d'usage applicatif de chronologie de notification.

/** Cette classe expose le point d'entree applicatif de lecture de chronologie. */
export class ObtenirChronologieNotification {
  /** Ce constructeur relie le cas d'usage au port de lecture. */
  constructor(
    private readonly portLectureNotifications: PortLectureNotifications,
    private readonly validateurRequeteChronologieNotification = new ValidateurRequeteChronologieNotification(),
    private readonly validateurCoherenceChronologieNotification = new ValidateurCoherenceChronologieNotification(),
  ) {}

  /** Cette methode retourne la chronologie projetee et verifie son ordre. */
  public async executer(requete: RequeteChronologieNotification): Promise<ModeleLectureChronologieNotification> {
    this.validateurRequeteChronologieNotification.valider(requete);
    const modele = await this.portLectureNotifications.obtenirChronologie(requete);
    this.validateurCoherenceChronologieNotification.valider(modele);
    return modele;
  }
}
