import { ErreurTenantInvalide } from '../exceptions/ErreurTenantInvalide';
import { UUID } from '../value-objects/TypesPrimitifs';

// Ce fichier contient la regle qui impose un contexte tenant sur les operations du BC.
/**
 * Cette policy verifie que l'organisation et l'ecole sont presentes.
 */
export class PolicyTenantContextObligatoire {
  /** Refuse une operation sans organisation ou sans ecole. */
  public verifierTenantPresent(idOrganisation?: UUID, idEcole?: UUID): void {
    if (idOrganisation === undefined || idOrganisation.trim().length === 0 || idEcole === undefined || idEcole.trim().length === 0) {
      throw new ErreurTenantInvalide('Le contexte tenant organisation/ecole est obligatoire.');
    }
  }
}
