import { CommandeAccuserReceptionNotification } from '../commands';
import { PortAuditNotification, PortMonitoringNotification } from '../ports';

// Ce fichier decrit la saga applicative d'accuse de reception.

/** Cette classe formalise le workflow event-driven d'accuse de reception. */
export class SagaAccuseReceptionNotification {
  /** Ce constructeur relie la saga a l'audit et au monitoring. */
  constructor(
    private readonly portAuditNotification: PortAuditNotification,
    private readonly portMonitoringNotification: PortMonitoringNotification,
  ) {}

  /** Cette methode emet les signaux transverses d'accuse de reception. */
  public async executer(commande: CommandeAccuserReceptionNotification): Promise<void> {
    await this.portAuditNotification.enregistrer('notification.acknowledge', {
      notificationId: commande.identifiantNotification,
      destinataireId: commande.destinataireId,
    });
    await this.portMonitoringNotification.enregistrerSignal('notifications.acknowledged', {
      notificationId: commande.identifiantNotification,
    });
  }
}
