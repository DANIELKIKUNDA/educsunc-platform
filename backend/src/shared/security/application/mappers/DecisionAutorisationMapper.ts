import type { DecisionAutorisation } from '../../../security/domain';
import type { DecisionAutorisationOutput } from '../dto/output';
export class DecisionAutorisationMapper {
  public static depuisDomaine(decision: DecisionAutorisation): DecisionAutorisationOutput {
    return {
      autorise: decision.estAutorise(),
      permissionDemandee: decision.obtenirPermissionDemandee().obtenirValeur(),
      raisonRefus: decision.obtenirRaisonRefus(),
      scopeValide: decision.obtenirScopeValide(),
      restrictionRespectee: decision.obtenirRestrictionRespectee(),
    };
  }
}
