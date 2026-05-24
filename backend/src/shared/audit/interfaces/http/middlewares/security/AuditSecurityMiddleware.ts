import type { FastifyRequest } from 'fastify';
import { ValidationError } from 'shared/exceptions/ValidationError';
import { verifierContenuDangereux } from '../AuditMiddlewareSupport';

// Ce middleware applique les protections HTTP de base du module Audit.
export class AuditSecurityMiddleware {
  public verifier(requete: FastifyRequest): void {
    if (
      requete.method !== 'GET'
      && requete.method !== 'DELETE'
      && typeof requete.headers['content-type'] === 'string'
      && !requete.headers['content-type'].includes('application/json')
    ) {
      throw new ValidationError(
        'Le content-type de la requete Audit est invalide.',
        'AUDIT_CONTENT_TYPE_INVALID',
      );
    }

    verifierContenuDangereux(requete.url, 'AUDIT_ROUTE_UNSAFE');
    verifierContenuDangereux(requete.body, 'AUDIT_BODY_UNSAFE');
    verifierContenuDangereux(requete.query, 'AUDIT_QUERY_UNSAFE');
  }
}

