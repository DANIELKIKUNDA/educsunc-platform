import { ErreurAccesTenantInterdit } from '../exceptions/ErreurAccesTenantInterdit';
import { UUID } from '../value-objects/TypesPrimitifs';

// Ce fichier contient la regle d'isolation par ecole.
/**
 * Cette policy empeche une ecole de manipuler les donnees d'une autre ecole.
 */
export class PolicyIsolationEcole {
  /** Verifie que l'ecole demandee correspond a l'ecole autorisee. */
  public verifierEcoleAutorisee(idEcoleAutorisee: UUID, idEcoleDemandee: UUID): void {
    if (idEcoleAutorisee !== idEcoleDemandee) {
      throw new ErreurAccesTenantInterdit('Acces interdit a une autre ecole.');
    }
  }
}
