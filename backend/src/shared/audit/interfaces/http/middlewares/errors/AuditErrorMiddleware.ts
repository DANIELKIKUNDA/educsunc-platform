import type { FastifyRequest } from 'fastify';
import { ErreurAuthentification } from 'shared/auth/domain/exceptions';
import {
  ErreurAutorisation,
  ErreurPermissionRefusee,
  ErreurScopeRefuse,
} from 'shared/security/domain';
import { ApplicationError } from 'shared/exceptions/ApplicationError';
import { ValidationError } from 'shared/exceptions/ValidationError';
import {
  AuditConflictException,
  AuditForbiddenException,
  AuditNotFoundException,
  AuditValidationException,
} from '../../../../application/exceptions/communes';
import type { AuditMiddlewareResultatErreur } from '../AuditMiddlewareTypes';
import { lireHeaderTexte, obtenirContexte } from '../AuditMiddlewareSupport';

// Ce middleware normalise les erreurs HTTP Audit sans exposer les details bruts.
export class AuditErrorMiddleware {
  public normaliser(erreur: unknown, requete: FastifyRequest): AuditMiddlewareResultatErreur {
    const contexte = obtenirContexte(requete);
    const requestId = contexte.requestId;
    const correlationId =
      contexte.correlationId ?? lireHeaderTexte(requete, 'x-correlation-id');

    if (erreur instanceof ValidationError) {
      return this.creerErreur(400, erreur.code, erreur.message, requestId, correlationId);
    }

    if (erreur instanceof AuditValidationException) {
      return this.creerErreur(400, 'AUDIT_VALIDATION_ERROR', erreur.message, requestId, correlationId);
    }

    if (erreur instanceof AuditNotFoundException) {
      return this.creerErreur(404, 'AUDIT_NOT_FOUND', erreur.message, requestId, correlationId);
    }

    if (erreur instanceof AuditForbiddenException) {
      return this.creerErreur(403, 'AUDIT_FORBIDDEN', erreur.message, requestId, correlationId);
    }

    if (erreur instanceof AuditConflictException) {
      return this.creerErreur(409, 'AUDIT_CONFLICT', erreur.message, requestId, correlationId);
    }

    if (erreur instanceof ErreurAuthentification) {
      return this.creerErreur(401, 'AUDIT_AUTH_ERROR', erreur.message, requestId, correlationId);
    }

    if (
      erreur instanceof ErreurPermissionRefusee
      || erreur instanceof ErreurScopeRefuse
      || erreur instanceof ErreurAutorisation
    ) {
      return this.creerErreur(
        403,
        'AUDIT_FORBIDDEN',
        erreur instanceof Error ? erreur.message : 'Acces Audit refuse.',
        requestId,
        correlationId,
      );
    }

    if (erreur instanceof ApplicationError) {
      return this.creerErreur(400, erreur.code, erreur.message, requestId, correlationId);
    }

    return this.creerErreur(
      500,
      'AUDIT_ROUTE_ERROR',
      'Une erreur Audit non detaillee est survenue.',
      requestId,
      correlationId,
    );
  }

  private creerErreur(
    statutHttp: number,
    code: string,
    message: string,
    requestId?: string,
    correlationId?: string,
  ): AuditMiddlewareResultatErreur {
    return {
      statutHttp,
      corps: {
        success: false,
        erreur: code,
        message,
        requestId,
        correlationId,
      },
    };
  }
}
