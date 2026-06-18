import { PortLectureNotifications } from '../ports';
import { RequeteTenantNotifications } from '../queries';
import { ModeleLectureTenantNotifications } from '../read-models';

// Ce fichier declare le cas d'usage applicatif de lecture consolidee par tenant.

/** Cette classe expose le point d'entree applicatif de supervision tenant-aware. */
export class ObtenirTenantNotifications {
  /** Ce constructeur relie le cas d'usage au port de lecture. */
  constructor(private readonly portLectureNotifications: PortLectureNotifications) {}

  /** Cette methode retourne une vue consolidee des notifications d'un tenant. */
  public async executer(requete: RequeteTenantNotifications): Promise<ModeleLectureTenantNotifications> {
    return this.portLectureNotifications.obtenirVueTenant(requete);
  }
}
