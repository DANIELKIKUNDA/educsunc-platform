import type { FastifyRequest } from 'fastify';
import { ErreurPermissionRefusee } from 'shared/security/domain';
import { obtenirContexte } from '../AuditMiddlewareSupport';

const ROLES_INTERNAL_AUDIT = new Set([
  'MANAGER_SYSTEME',
  'OPERATEUR_SYSTEME',
]);

// Ce middleware reserve les routes internes Audit a la gouvernance plateforme explicite.
export class AuditInternalMiddleware {
  public verifier(requete: FastifyRequest): void {
    const contexte = obtenirContexte(requete);
    const roleActif = contexte.roleActif ?? '';

    if (!ROLES_INTERNAL_AUDIT.has(roleActif)) {
      throw new ErreurPermissionRefusee(
        'Cette route interne Audit est reservee aux acteurs plateforme explicites.',
      );
    }

    const portePlateforme = (contexte.scopes ?? []).some(
      (scope) => scope.obtenirTypeScope().obtenirValeur() === 'PLATEFORME',
    );

    if (!portePlateforme) {
      throw new ErreurPermissionRefusee(
        "Le scope plateforme est requis pour cette route interne Audit.",
      );
    }
  }
}
