import type { FastifyRequest } from 'fastify';
import { ValidationError } from 'shared/exceptions/ValidationError';
import { obtenirContexte } from '../AuditMiddlewareSupport';

// Ce middleware protege la coherence offline-first des endpoints de synchronisation Audit.
export class AuditSynchronizationMiddleware {
  public verifier(requete: FastifyRequest): void {
    const contexte = obtenirContexte(requete);
    if (!contexte.deviceId) {
      throw new ValidationError(
        "L'identifiant de l'appareil est obligatoire pour synchroniser Audit.",
        'AUDIT_SYNC_DEVICE_REQUIRED',
      );
    }

    const body = requete.body;
    if (body !== undefined && (typeof body !== 'object' || body === null || Array.isArray(body))) {
      throw new ValidationError(
        'Le payload de synchronisation Audit est invalide.',
        'AUDIT_SYNC_BODY_INVALID',
      );
    }
  }
}

