import type { FastifyRequest } from 'fastify';
import { ValidationError } from 'shared/exceptions/ValidationError';
import {
  calculerTaillePayload,
  verifierContenuDangereux,
  verifierObjetSerializable,
} from '../AuditMiddlewareSupport';

// Ce middleware bloque les payloads techniques manifestement invalides avant les validators Audit.
export class AuditValidationMiddleware {
  constructor(private readonly tailleMaxPayload = 2_000_000) {}

  public verifier(requete: FastifyRequest): void {
    verifierObjetSerializable(requete.body, 'AUDIT_HTTP_BODY_INVALID');
    verifierObjetSerializable(requete.query, 'AUDIT_HTTP_QUERY_INVALID');
    verifierObjetSerializable(requete.params, 'AUDIT_HTTP_PARAMS_INVALID');
    verifierContenuDangereux(requete.body, 'AUDIT_HTTP_BODY_UNSAFE');
    verifierContenuDangereux(requete.query, 'AUDIT_HTTP_QUERY_UNSAFE');

    const taille = calculerTaillePayload(requete.body);
    if (taille > this.tailleMaxPayload) {
      throw new ValidationError(
        'Le payload Audit depasse la taille autorisee.',
        'AUDIT_HTTP_PAYLOAD_TOO_LARGE',
      );
    }
  }
}

