import { DtoDetailsNotification } from '../dto';
import { CommandeAccuserReceptionNotification } from '../commands';
import { PortAccuseReceptionNotification, PortAuditNotification, PortLectureNotifications, PortMonitoringNotification } from '../ports';
import { MappeurNotificationVersDto } from '../mappers';
import { RequeteDetailsNotification } from '../queries';
import { SagaAccuseReceptionNotification } from '../sagas';
import { ValidateurCommandeAccuseReceptionNotification } from '../validators';

// Ce fichier declare le cas d'usage applicatif d'accuse de reception.

/** Cette classe expose le point d'entree applicatif d'accuse de reception. */
export class AccuserReceptionNotification implements PortAccuseReceptionNotification {
  /** Ce constructeur relie le cas d'usage a la lecture et aux signaux transverses. */
  constructor(
    private readonly portLectureNotifications: PortLectureNotifications,
    portAuditNotification: PortAuditNotification,
    portMonitoringNotification: PortMonitoringNotification,
    private readonly validateurCommandeAccuseReceptionNotification = new ValidateurCommandeAccuseReceptionNotification(),
  ) {
    this.sagaAccuseReceptionNotification = new SagaAccuseReceptionNotification(
      portAuditNotification,
      portMonitoringNotification,
    );
  }

  private readonly sagaAccuseReceptionNotification: SagaAccuseReceptionNotification;

  /** Cette methode accuse la reception puis relit la vue detail. */
  public async executer(commande: CommandeAccuserReceptionNotification): Promise<DtoDetailsNotification> {
    this.validateurCommandeAccuseReceptionNotification.valider(commande);
    await this.sagaAccuseReceptionNotification.executer(commande);
    const details = await this.portLectureNotifications.obtenirDetails({
      identifiantNotification: commande.identifiantNotification,
    } as RequeteDetailsNotification);
    if (details === null) {
      throw new Error('La notification accusee est introuvable.');
    }
    return MappeurNotificationVersDto.depuisModeleLecture(details);
  }
}
