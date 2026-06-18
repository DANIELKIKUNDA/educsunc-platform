import { CommandeRejouerNotification } from '../commands';
import { Notification } from '../../domain';
import { PortAuditNotification, PortFileReplayNotification, PortMonitoringNotification } from '../ports';
import { ServiceApplicationNotifications } from '../services';
import { ValidateurCommandeRejeuNotification } from '../validators';

// Ce fichier orchestre le workflow de rejeu technique d'une notification.

/** Cette classe coordonne la securisation et la mise en file d'un rejeu. */
export class OrchestrateurReplayNotification {
  /** Ce constructeur assemble les dependances utiles au rejeu. */
  constructor(
    private readonly serviceApplicationNotifications: ServiceApplicationNotifications,
    private readonly portFileReplayNotification: PortFileReplayNotification,
    private readonly portAuditNotification: PortAuditNotification,
    private readonly portMonitoringNotification: PortMonitoringNotification,
    private readonly validateurCommandeRejeuNotification = new ValidateurCommandeRejeuNotification(),
  ) {}

  /** Cette methode orchestre un rejeu technique. */
  public async executer(commande: CommandeRejouerNotification): Promise<Notification> {
    this.validateurCommandeRejeuNotification.valider(commande);
    const notification = await this.serviceApplicationNotifications.chargerNotificationExigee(
      commande.identifiantNotification,
    );
    notification.demarrerReplay(commande.raison, commande.acteurId);
    await this.serviceApplicationNotifications.sauvegarderEtPublier(notification);
    await this.portFileReplayNotification.ajouter(commande.identifiantNotification, {
      correlationId: commande.correlationId,
      requestId: commande.requestId,
      raison: commande.raison,
      rebatirChronologie: commande.rebatirChronologie,
      autoriserRenduCanal: commande.autoriserRenduCanal,
    });
    await this.portAuditNotification.enregistrer('notification.replay', {
      notificationId: commande.identifiantNotification,
      raison: commande.raison,
    });
    await this.portMonitoringNotification.enregistrerSignal('notifications.replay', {
      notificationId: commande.identifiantNotification,
    });
    return notification;
  }
}
