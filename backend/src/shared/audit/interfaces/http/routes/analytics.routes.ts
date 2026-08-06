import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesAudit } from './DependancesRoutesAudit';
import { appliquerPoliciesRouteAudit, executerRouteAudit } from './_route-helpers';

export const creerAnalyticsRoutes = (dependances: DependancesRoutesAudit): FastifyPluginAsync => async (serveur) => {
  serveur.get('/api/v1/analytics/audit', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.analytics.read',
        scope: 'ORGANISATION',
        monitoring: true,
      });
      return dependances.auditAnalyticsController.audit({
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
        authorizedScope: 'ORGANISATION',
      });
    }));

  serveur.get('/api/v1/analytics/exports', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.analytics.read',
        scope: 'ORGANISATION',
        monitoring: true,
        exports: true,
      });
      return dependances.auditAnalyticsController.exports({
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
        authorizedScope: 'ORGANISATION',
      });
    }));

  serveur.get('/api/v1/analytics/synchronization', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.analytics.read',
        scope: 'ORGANISATION',
        monitoring: true,
        synchronization: true,
      });
      return dependances.auditAnalyticsController.synchronization({
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
        authorizedScope: 'ORGANISATION',
      });
    }));

  serveur.get('/api/v1/analytics/tenants', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.analytics.read',
        scope: 'ORGANISATION',
        monitoring: true,
      });
      return dependances.auditAnalyticsController.volumetrie({
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
        authorizedScope: 'ORGANISATION',
      });
    }));
};
