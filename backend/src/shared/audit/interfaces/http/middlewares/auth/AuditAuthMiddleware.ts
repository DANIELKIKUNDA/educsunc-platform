import type { FastifyRequest } from 'fastify';
import {
  JwtAuthenticationMiddleware,
  SessionMiddleware,
} from 'shared/auth/interfaces/http/middlewares';
import { ErreurAuthentification } from 'shared/auth/domain/exceptions';
import { obtenirContexte } from '../AuditMiddlewareSupport';

// Ce middleware s assure qu une identite exploitable existe avant toute action Audit sensible.
export class AuditAuthMiddleware {
  constructor(
    private readonly jwtAuthenticationMiddleware?: JwtAuthenticationMiddleware,
    private readonly sessionMiddleware?: SessionMiddleware,
  ) {}

  public async verifier(requete: FastifyRequest): Promise<void> {
    if (requete.context?.utilisateurId) {
      return;
    }

    const payload = this.jwtAuthenticationMiddleware
      ? await this.jwtAuthenticationMiddleware.authentifier(requete.headers)
      : null;

    if (!payload || typeof payload.sub !== 'string') {
      throw new ErreurAuthentification("L'authentification est obligatoire pour Audit.");
    }

    if (this.sessionMiddleware) {
      await this.sessionMiddleware.verifierSession(requete.headers, requete.body);
    }

    const contexte = obtenirContexte(requete);
    requete.context = {
      ...contexte,
      utilisateurId: payload.sub,
      roleActif:
        typeof payload.roleActif === 'string'
          ? payload.roleActif
          : typeof payload.role === 'string'
            ? payload.role
            : contexte.roleActif,
    };
  }
}

