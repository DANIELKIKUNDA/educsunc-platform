import { ErreurOrganisationEcoleIncoherente } from '../exceptions/ErreurOrganisationEcoleIncoherente';
import { UUID } from '../value-objects/TypesPrimitifs';

// Ce fichier contient la regle de coherence entre organisation et ecole.
/**
 * Cette policy verifie qu'une ecole appartient bien a l'organisation utilisee.
 */
export class PolicyOrganisationEcoleCoherente {
  /** Refuse une operation si l'ecole ne depend pas de l'organisation attendue. */
  public verifierRattachementOrganisationEcole(idOrganisationAttendue: UUID, idOrganisationDeLEcole: UUID): void {
    if (idOrganisationAttendue !== idOrganisationDeLEcole) {
      throw new ErreurOrganisationEcoleIncoherente('L ecole ne correspond pas a l organisation fournie.');
    }
  }
}
