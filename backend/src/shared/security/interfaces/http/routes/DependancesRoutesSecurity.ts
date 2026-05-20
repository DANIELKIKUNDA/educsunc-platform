import type { FastifyPluginAsync } from 'fastify';
import {
  AffectationUtilisateurController,
  AutorisationController,
  ContexteActifController,
  RoleController,
  SecuriteAuditController,
  TitulariatController,
} from '../controllers';
import { PermissionGuard, RestrictionMetierGuard, ScopeGuard, TitulariatGuard } from '../guards';
import type { SecurityContextMiddleware } from 'shared/security/infrastructure';

// Cette interface regroupe tout le necessaire pour brancher les routes SECURITY.
export interface DependancesRoutesSecurity {
  roleController: RoleController;
  affectationUtilisateurController: AffectationUtilisateurController;
  titulariatController: TitulariatController;
  autorisationController: AutorisationController;
  contexteActifController: ContexteActifController;
  securiteAuditController: SecuriteAuditController;
  permissionGuard: PermissionGuard;
  scopeGuard: ScopeGuard;
  titulariatGuard: TitulariatGuard;
  restrictionMetierGuard: RestrictionMetierGuard;
  securityContextMiddleware: SecurityContextMiddleware;
}

// Ce type documente la signature de creation des routes SECURITY.
export type FabriqueRoutesSecurity = (dependances: DependancesRoutesSecurity) => FastifyPluginAsync;
