import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesAudit } from './DependancesRoutesAudit';
import { appliquerPoliciesRouteAudit, executerRouteAudit } from './_route-helpers';
import { auditIntegrityEntryOpenApi, auditIntegrityRangeOpenApi } from './AuditL5OpenApi';

export const creerSecurityRoutes = (dependances: DependancesRoutesAudit): FastifyPluginAsync => async (serveur) => {
  serveur.get('/api/v1/security/integrity/:id', { schema: auditIntegrityEntryOpenApi }, (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.security.read', security: true, monitoring: true,
      });
      return dependances.auditSecurityController.integriteEntree({
        params: requete.params as never, headers: requete.headers, context: requete.context,
      });
    }));

  serveur.post('/api/v1/security/integrity/verify', { schema: auditIntegrityRangeOpenApi }, (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.security.read', admin: true, throttled: true, security: true, monitoring: true,
      });
      return dependances.auditSecurityController.integritePlage({
        body: requete.body as never, headers: requete.headers, context: requete.context,
      });
    }, 202));

  serveur.get('/api/v1/security/incidents/:id', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.security.read',
        scope: 'ORGANISATION',
        security: true,
        monitoring: true,
      });
      return dependances.auditSecurityController.incidents({
        params: requete.params as never,
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
        authorizedScope: 'ORGANISATION',
      });
    }));

  serveur.get('/api/v1/security/anomalies', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.security.read',
        scope: 'ORGANISATION',
        security: true,
        monitoring: true,
      });
      return dependances.auditSecurityController.anomalies({
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
        authorizedScope: 'ORGANISATION',
      });
    }));

  serveur.get('/api/v1/security/access', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.security.read',
        scope: 'ORGANISATION',
        security: true,
        monitoring: true,
      });
      return dependances.auditSecurityController.acces({
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
        authorizedScope: 'ORGANISATION',
      });
    }));
};
