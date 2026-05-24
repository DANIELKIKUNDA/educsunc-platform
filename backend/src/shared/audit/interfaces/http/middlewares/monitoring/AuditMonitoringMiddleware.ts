import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  lireDebutTraitement,
  lireMonitoring,
  lireTaillePayload,
} from '../AuditMiddlewareSupport';

// Ce middleware expose les metriques runtime minimales des requetes Audit.
export class AuditMonitoringMiddleware {
  public preparer(requete: FastifyRequest): void {
    const snapshot = lireMonitoring(requete);
    if (!snapshot) {
      return;
    }
  }

  public surSucces(requete: FastifyRequest, reponse: FastifyReply): void {
    const debut = lireDebutTraitement(requete);
    const duree = debut ? Date.now() - debut : 0;
    reponse.header('x-audit-duration-ms', String(duree));
    reponse.header('x-audit-request-size', String(lireTaillePayload(requete)));
  }

  public surErreur(requete: FastifyRequest, reponse: FastifyReply): void {
    this.surSucces(requete, reponse);
  }
}

