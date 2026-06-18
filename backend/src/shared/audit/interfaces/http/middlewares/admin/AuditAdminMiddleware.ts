import type { FastifyRequest } from 'fastify';
import { ErreurPermissionRefusee } from 'shared/security/domain';
import { obtenirContexte } from '../AuditMiddlewareSupport';

const ROLES_ADMIN_PLATEFORME = new Set([
  'MANAGER_SYSTEME',
  'OPERATEUR_SYSTEME',
]);

const ROLES_ADMIN_ORGANISATION = new Set([
  ...ROLES_ADMIN_PLATEFORME,
  'PROMOTEUR_ORGANISATION',
  'ADMIN_SYSTEME_ORGANISATION',
]);

const ROLES_ADMIN_ECOLE = new Set([
  ...ROLES_ADMIN_ORGANISATION,
  'ADMINISTRATEUR_ECOLE',
  'ADMIN_SYSTEME_ECOLE',
]);

// Ce middleware reserve les operations Audit d'administration aux roles de gouvernance compatibles avec leur niveau.
export class AuditAdminMiddleware {
  public verifier(requete: FastifyRequest): void {
    const contexte = obtenirContexte(requete);
    const roleActif = contexte.roleActif ?? '';

    if (!roleActif) {
      throw new ErreurPermissionRefusee(
        "Un role actif de gouvernance est requis pour cette operation d'administration Audit.",
      );
    }

    if (this.estRoutePlateforme(requete)) {
      if (ROLES_ADMIN_PLATEFORME.has(roleActif)) {
        return;
      }

      throw new ErreurPermissionRefusee(
        "Cette operation d'administration Audit est reservee a la gouvernance plateforme.",
      );
    }

    if (this.estRouteOrganisationnelle(contexte)) {
      if (ROLES_ADMIN_ORGANISATION.has(roleActif)) {
        return;
      }

      throw new ErreurPermissionRefusee(
        "Cette operation d'administration Audit est reservee a la gouvernance organisationnelle ou plateforme.",
      );
    }

    if (this.estRouteEcole(contexte)) {
      if (ROLES_ADMIN_ECOLE.has(roleActif)) {
        return;
      }

      throw new ErreurPermissionRefusee(
        "Cette operation d'administration Audit est reservee a la gouvernance ecole, organisation ou plateforme.",
      );
    }

    if (ROLES_ADMIN_PLATEFORME.has(roleActif)) {
      return;
    }

    throw new ErreurPermissionRefusee(
      "Cette operation d'administration Audit requiert un role de gouvernance explicite.",
    );
  }

  private estRoutePlateforme(requete: FastifyRequest): boolean {
    return requete.url.startsWith('/api/v1/admin/')
      || requete.url.startsWith('/api/v1/internal/');
  }

  private estRouteOrganisationnelle(contexte: ReturnType<typeof obtenirContexte>): boolean {
    return Boolean(contexte.organisationActiveId) && !contexte.ecoleActiveId;
  }

  private estRouteEcole(contexte: ReturnType<typeof obtenirContexte>): boolean {
    return Boolean(contexte.ecoleActiveId);
  }
}
