import type { FastifyRequest } from 'fastify';
import {
  assurerCorrelationId,
  assurerRequestId,
  calculerTaillePayload,
  memoriserDebutTraitement,
  memoriserMonitoring,
  memoriserTaillePayload,
} from '../AuditMiddlewareSupport';

// Ce middleware initialise la base d observabilite d une requete Audit.
export class AuditObservabilityMiddleware {
  public observer(requete: FastifyRequest): void {
    const requestId = assurerRequestId(requete);
    const correlationId = assurerCorrelationId(requete);
    const startedAt = memoriserDebutTraitement(requete);
    const requestSize = calculerTaillePayload(requete.body);
    memoriserTaillePayload(requete, requestSize);
    memoriserMonitoring(requete, {
      requestId,
      correlationId,
      startedAt,
      requestSize,
      deviceId: requete.context?.deviceId,
      appVersion: requete.context?.appVersion,
      plateforme: requete.context?.plateforme,
      modeOffline: requete.context?.modeOffline,
      syncId: requete.context?.syncId,
    });
  }
}
