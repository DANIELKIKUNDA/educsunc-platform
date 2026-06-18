import { CommandeCreerNotification } from '../commands';
import { Notification } from '../../domain';
import { PortAuditNotification, PortConfigurationNotification, PortFileDispatchNotification, PortIdempotenceNotification, PortMonitoringNotification } from '../ports';
import { ServiceApplicationNotifications } from '../services';
import { ValidateurCommandeCreationNotification, ValidateurIdempotenceNotification } from '../validators';

// Ce fichier orchestre le workflow applicatif complet de creation de notification.

/** Cette classe coordonne validation, construction, persistence et mise en file. */
export class OrchestrateurCreationNotification {
  /** Ce constructeur assemble toutes les dependances utiles a la creation. */
  constructor(
    private readonly serviceApplicationNotifications: ServiceApplicationNotifications,
    private readonly portFileDispatchNotification: PortFileDispatchNotification,
    private readonly portIdempotenceNotification: PortIdempotenceNotification,
    private readonly portMonitoringNotification: PortMonitoringNotification,
    private readonly portAuditNotification: PortAuditNotification,
    private readonly portConfigurationNotification: PortConfigurationNotification,
    private readonly validateurCommandeCreationNotification = new ValidateurCommandeCreationNotification(),
  ) {}

  /** Cette methode orchestre la creation, la sauvegarde et la mise en file. */
  public async executer(commande: CommandeCreerNotification): Promise<Notification> {
    this.validateurCommandeCreationNotification.valider(commande);
    const validateurIdempotence = new ValidateurIdempotenceNotification(this.portIdempotenceNotification);
    await validateurIdempotence.valider(commande.idempotencyKey);

    const enfilementActif = await this.portConfigurationNotification.lire<boolean>(
      'notifications.dispatch.autoQueue',
      true,
    );

    const notification = await this.serviceApplicationNotifications.creerDepuisCommande(commande);
    notification.valider();
    if (commande.datePlanification) {
      // Le document attend la notion de planification a ce niveau, meme si le runtime exact vient plus tard.
      notification.ajouterEvenement({ type: 'EvenementNotificationPlanifiee', occuredOn: new Date() } as never);
    }
    if (enfilementActif) {
      notification.mettreEnFile();
    }

    await this.serviceApplicationNotifications.sauvegarderEtPublier(notification);

    if (enfilementActif) {
      await this.portFileDispatchNotification.ajouter(notification.obtenirIdentifiant().obtenirValeur(), {
        correlationId: commande.correlationId,
        requestId: commande.requestId,
      });
    }

    if (commande.idempotencyKey) {
      await this.portIdempotenceNotification.enregistrerTraitement(commande.idempotencyKey, {
        notificationId: notification.obtenirIdentifiant().obtenirValeur(),
      });
    }

    await this.portAuditNotification.enregistrer('notification.creation', {
      notificationId: notification.obtenirIdentifiant().obtenirValeur(),
      type: commande.type,
    });
    await this.portMonitoringNotification.enregistrerSignal('notifications.created', {
      type: commande.type,
      priorite: commande.priorite,
    });

    return notification;
  }
}
