import type { FastifyRequest } from 'fastify';
import { TenantMiddleware } from 'shared/auth/interfaces/http/middlewares';
import { exigerScopeContexte, obtenirContexte } from '../AuditMiddlewareSupport';

// Ce middleware garantit que le contexte tenant Audit reste coheremment resolu.
export class AuditTenantMiddleware {
  constructor(private readonly tenantMiddleware?: TenantMiddleware) {}

  public async verifier(requete: FastifyRequest): Promise<void> {
    if (this.tenantMiddleware) {
      await this.tenantMiddleware.verifier(requete.headers);
    }

    const contexte = obtenirContexte(requete);
    if (contexte.ecoleActiveId) {
      exigerScopeContexte(requete, 'ECOLE');
      return;
    }

    if (contexte.organisationActiveId) {
      exigerScopeContexte(requete, 'ORGANISATION');
    }
  }
}

