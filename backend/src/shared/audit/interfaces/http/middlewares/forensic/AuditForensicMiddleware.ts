import type { FastifyRequest } from 'fastify';
import { ValidationError } from 'shared/exceptions/ValidationError';
import {
  exigerPermissionContexte,
  exigerUtilisateurAuthentifie,
  obtenirContexte,
} from '../AuditMiddlewareSupport';

// Ce middleware durcit l acces aux endpoints forensic du module Audit.
export class AuditForensicMiddleware {
  public verifier(requete: FastifyRequest): void {
    exigerUtilisateurAuthentifie(requete);
    const contexte = obtenirContexte(requete);

    if (contexte.modeOffline) {
      throw new ValidationError(
        'Les investigations forensic ne sont pas accessibles en mode offline.',
        'AUDIT_FORENSIC_OFFLINE_FORBIDDEN',
      );
    }

    if (
      !contexte.permissions.includes('forensic.read')
      && !contexte.permissions.includes('forensic.export')
      && !contexte.permissions.includes('forensic.replay')
    ) {
      exigerPermissionContexte(requete, 'forensic.read');
    }
  }
}

