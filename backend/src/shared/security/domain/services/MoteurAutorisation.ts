import { DecisionAutorisation } from '../entities/DecisionAutorisation';
import { RestrictionRole } from '../entities/RestrictionRole';
import { PermissionRefusee } from '../events/PermissionRefusee';
import { RestrictionMetierDetectee } from '../events/RestrictionMetierDetectee';
import { ScopeRefuse } from '../events/ScopeRefuse';
import { PermissionRole } from '../entities/PermissionRole';
import { PermissionSecurite } from '../value-objects/PermissionSecurite';

// Ce moteur produit une decision metier d'autorisation a partir des permissions et restrictions.
export class MoteurAutorisation {
  public verifierPermission(
    permissions: readonly PermissionRole[],
    restrictions: readonly RestrictionRole[],
    permissionDemandee: string,
    scopeValide: boolean,
  ): { decision: DecisionAutorisation; evenements: Array<object> } {
    const permission = new PermissionSecurite(permissionDemandee);
    const permissionPresente = permissions.some((item) => item.obtenirPermission().obtenirValeur() === permission.obtenirValeur());
    const restrictionRespectee = restrictions.length === 0;

    if (!permissionPresente) {
      return {
        decision: new DecisionAutorisation({
          autorise: false,
          permissionDemandee: permission,
          raisonRefus: 'Permission absente',
          scopeValide,
          restrictionRespectee,
        }),
        evenements: [new PermissionRefusee('inconnu', permission.obtenirValeur(), 'Permission absente')],
      };
    }

    if (!scopeValide) {
      return {
        decision: new DecisionAutorisation({
          autorise: false,
          permissionDemandee: permission,
          raisonRefus: 'Scope refuse',
          scopeValide: false,
          restrictionRespectee,
        }),
        evenements: [new ScopeRefuse('inconnu', 'inconnu')],
      };
    }

    if (!restrictionRespectee) {
      return {
        decision: new DecisionAutorisation({
          autorise: false,
          permissionDemandee: permission,
          raisonRefus: 'Restriction metier',
          scopeValide: true,
          restrictionRespectee: false,
        }),
        evenements: [new RestrictionMetierDetectee('inconnu', 'restriction')],
      };
    }

    return {
      decision: new DecisionAutorisation({
        autorise: true,
        permissionDemandee: permission,
        scopeValide: true,
        restrictionRespectee: true,
      }),
      evenements: [],
    };
  }
}
