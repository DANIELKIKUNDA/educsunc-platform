import type { FastifyRequest } from 'fastify';
import { creerAuditContext } from 'shared/audit/context';
import {
  assurerCorrelationId,
  assurerRequestId,
  obtenirContexte,
  propagerHeadersContexte,
} from '../AuditMiddlewareSupport';

// Ce middleware consolide le contexte runtime exploitable par tout le module Audit.
export class AuditContextMiddleware {
  public injecter(requete: FastifyRequest): void {
    assurerRequestId(requete);
    assurerCorrelationId(requete);
    const contexte = obtenirContexte(requete);

    requete.context = {
      ...contexte,
      adresseIp: contexte.adresseIp ?? requete.ip,
      userAgent:
        contexte.userAgent
        ?? (typeof requete.headers['user-agent'] === 'string'
          ? requete.headers['user-agent']
          : undefined),
      deviceId:
        contexte.deviceId
        ?? (typeof requete.headers['x-device-id'] === 'string'
          ? requete.headers['x-device-id']
          : undefined),
      appVersion:
        contexte.appVersion
        ?? (typeof requete.headers['x-app-version'] === 'string'
          ? requete.headers['x-app-version']
          : undefined),
      plateforme:
        contexte.plateforme
        ?? (typeof requete.headers['x-platform'] === 'string'
          ? requete.headers['x-platform']
          : undefined),
      syncId:
        contexte.syncId
        ?? (typeof requete.headers['x-sync-id'] === 'string'
          ? requete.headers['x-sync-id']
          : undefined),
      modeOffline:
        contexte.modeOffline
        || (typeof requete.headers['x-offline-mode'] === 'string'
          && requete.headers['x-offline-mode'] === 'true'),
    };

    requete.requestId = requete.context.requestId;
    requete.correlationId = requete.context.correlationId;
    requete.auditContext = creerAuditContext(requete, requete.context);
    propagerHeadersContexte(requete);
  }
}
