import type { FastifyRequest } from 'fastify';
import { assurerRequestId } from '../AuditMiddlewareSupport';

// Ce middleware garantit un request_id unique sur tout le pipeline Audit.
export class RequestIdMiddleware {
  public appliquer(requete: FastifyRequest): string {
    return assurerRequestId(requete);
  }
}

