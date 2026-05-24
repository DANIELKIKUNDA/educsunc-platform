import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesAudit } from './DependancesRoutesAudit';
import { appliquerPoliciesRouteAudit, executerRouteAudit } from './_route-helpers';

export const creerSecurityRoutes = (dependances: DependancesRoutesAudit): FastifyPluginAsync => async (serveur) => {
  serveur.get('/api/v1/security/incidents', (requete, reponse) =>
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
      });
    }));
};
