import type { FastifyRequest } from 'fastify';
import { ValidationError } from 'shared/exceptions/ValidationError';
import { exigerUtilisateurAuthentifie, lireHeaderTexte } from '../AuditMiddlewareSupport';

// Ce middleware protege les routes de retry Audit contre les boucles et les storms.
export class AuditRetryMiddleware {
  constructor(private readonly limiteRetry = 10) {}

  public verifier(requete: FastifyRequest): void {
    exigerUtilisateurAuthentifie(requete);

    const tentative = lireHeaderTexte(requete, 'x-retry-count');
    if (!tentative) {
      return;
    }

    const compteur = Number(tentative);
    if (!Number.isFinite(compteur) || compteur < 0 || compteur > this.limiteRetry) {
      throw new ValidationError(
        'Le compteur de retry Audit est invalide.',
        'AUDIT_RETRY_COUNT_INVALID',
      );
    }
  }
}

