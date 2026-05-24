import type { FastifyRequest } from 'fastify';
import { ValidationError } from 'shared/exceptions/ValidationError';
import { exigerUtilisateurAuthentifie, lireHeaderTexte } from '../AuditMiddlewareSupport';

// Ce middleware protege les routes de replay Audit contre les relectures abusives.
export class AuditReplayMiddleware {
  constructor(private readonly limiteFenetreHeures = 168) {}

  public verifier(requete: FastifyRequest): void {
    exigerUtilisateurAuthentifie(requete);

    const fenetre = lireHeaderTexte(requete, 'x-replay-window-hours');
    if (fenetre) {
      const heures = Number(fenetre);
      if (!Number.isFinite(heures) || heures <= 0 || heures > this.limiteFenetreHeures) {
        throw new ValidationError(
          'La fenetre de replay Audit est invalide.',
          'AUDIT_REPLAY_WINDOW_INVALID',
        );
      }
    }
  }
}

