import { ErreurAccesTenantInterdit } from '../exceptions/ErreurAccesTenantInterdit';
import { UUID } from '../value-objects/TypesPrimitifs';

// Ce fichier contient la regle d'isolation par organisation.
/**
 * Cette policy empeche une organisation de lire ou modifier les donnees d'une autre.
 */
export class PolicyIsolationOrganisation {
  /** Verifie que l'organisation demandee correspond a l'organisation autorisee. */
  public verifierOrganisationAutorisee(idOrganisationAutorisee: UUID, idOrganisationDemandee: UUID): void {
    if (idOrganisationAutorisee !== idOrganisationDemandee) {
      throw new ErreurAccesTenantInterdit('Acces interdit a une autre organisation.');
    }
  }
}
