import type { FastifyRequest } from 'fastify';
import { RateLimitMiddleware } from 'shared/auth/interfaces/http/middlewares';
import type { AuditMiddlewareOptionsThrottling } from '../AuditMiddlewareTypes';
import { exigerUtilisateurAuthentifie } from '../AuditMiddlewareSupport';

// Ce middleware prepare le throttling des routes Audit les plus sensibles.
export class AuditThrottlingMiddleware {
  constructor(private readonly rateLimitMiddleware = new RateLimitMiddleware()) {}

  public verifier(
    requete: FastifyRequest,
    options: AuditMiddlewareOptionsThrottling = {},
  ): void {
    const identite = requete.context?.utilisateurId ?? exigerUtilisateurAuthentifie(requete);
    const cle =
      options.cle
      ?? `${requete.method}:${requete.routeOptions.url}:${identite}`;

    this.rateLimitMiddleware.verifier(
      cle,
      options.limite ?? 20,
      options.fenetreMs ?? 60_000,
    );
  }
}

