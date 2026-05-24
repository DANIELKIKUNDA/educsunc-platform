import type { FastifyRequest } from 'fastify';
import { assurerCorrelationId } from '../AuditMiddlewareSupport';

// Ce middleware garantit un correlation_id stable pour le workflow Audit.
export class CorrelationMiddleware {
  public appliquer(requete: FastifyRequest): string {
    return assurerCorrelationId(requete);
  }
}

