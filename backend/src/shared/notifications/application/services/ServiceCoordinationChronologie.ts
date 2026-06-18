import { Notification } from '../../domain';
import { PortDepotChronologieNotification } from '../ports';

// Ce fichier coordonne la persistence append-only de la chronologie Notifications.

/** Cette classe publie la timeline locale de l'agregat vers le depot de chronologie. */
export class ServiceCoordinationChronologie {
  /** Ce constructeur relie le service au port applicatif de chronologie. */
  constructor(private readonly portDepotChronologie: PortDepotChronologieNotification) {}

  /** Cette methode persiste toutes les entrees de timeline connues de l'agregat. */
  public async synchroniser(notification: Notification): Promise<void> {
    const identifiantNotification = notification.obtenirIdentifiant().obtenirValeur();
    const timeline = notification.obtenirTimeline();

    for (const entree of timeline) {
      await this.portDepotChronologie.ajouterEntree(identifiantNotification, entree);
    }
  }
}
