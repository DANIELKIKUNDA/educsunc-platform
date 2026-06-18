import { CommandeEscaladerNotification } from '../commands';
import { Notification } from '../../domain';
import { PortAuditNotification, PortFileEscaladeNotification, PortMonitoringNotification } from '../ports';
import { ServiceApplicationNotifications } from '../services';
import { ValidateurCommandeEscaladeNotification } from '../validators';

// Ce fichier orchestre le workflow d'escalade de notification.

/** Cette classe coordonne l'escalade applicative et son execution asynchrone. */
export class OrchestrateurEscaladeNotification {
  /** Ce constructeur assemble les dependances utiles a l'escalade. */
  constructor(
    private readonly serviceApplicationNotifications: ServiceApplicationNotifications,
    private readonly portFileEscaladeNotification: PortFileEscaladeNotification,
    private readonly portAuditNotification: PortAuditNotification,
    private readonly portMonitoringNotification: PortMonitoringNotification,
    private readonly validateurCommandeEscaladeNotification = new ValidateurCommandeEscaladeNotification(),
  ) {}

  /** Cette methode orchestre une escalade de notification. */
  public async executer(commande: CommandeEscaladerNotification): Promise<Notification> {
    this.validateurCommandeEscaladeNotification.valider(commande);
    const notification = await this.serviceApplicationNotifications.chargerNotificationExigee(
      commande.identifiantNotification,
    );
    await this.portFileEscaladeNotification.ajouter(commande.identifiantNotification, {
      raison: commande.raison,
      correlationId: commande.correlationId,
      requestId: commande.requestId,
      audience: commande.nouveauxDestinataires?.map((element) => element.destinataireId) ?? [],
    });
    await this.portAuditNotification.enregistrer('notification.escalade', {
      notificationId: commande.identifiantNotification,
      raison: commande.raison,
    });
    await this.portMonitoringNotification.enregistrerSignal('notifications.escalade', {
      notificationId: commande.identifiantNotification,
    });
    return notification;
  }
}
