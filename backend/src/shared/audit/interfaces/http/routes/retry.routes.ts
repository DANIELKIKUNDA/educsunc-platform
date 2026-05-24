import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesAudit } from './DependancesRoutesAudit';
import { appliquerPoliciesRouteAudit, executerRouteAudit } from './_route-helpers';

export const creerRetryRoutes = (dependances: DependancesRoutesAudit): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/v1/retry/job/:id', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.retry',
        scope: 'ORGANISATION',
        admin: true,
        throttled: true,
        retry: true,
      });
      return dependances.auditRetryController.relancerJob({
        params: requete.params as never,
        body: requete.body as never,
        headers: requete.headers,
        context: requete.context,
      });
    }, 202));

  serveur.post('/api/v1/retry/export/:id', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.retry',
        scope: 'ORGANISATION',
        admin: true,
        throttled: true,
        retry: true,
        exports: true,
      });
      return dependances.auditRetryController.relancerExportAudit({
        params: requete.params as never,
        body: requete.body as never,
        headers: requete.headers,
        context: requete.context,
      });
    }, 202));

  serveur.post('/api/v1/retry/sync/:id', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.sync.retry',
        scope: 'ECOLE',
        throttled: true,
        retry: true,
        synchronization: true,
      });
      return dependances.auditRetryController.relancerSynchronisation({
        params: requete.params as never,
        body: requete.body as never,
        headers: requete.headers,
        context: requete.context,
      });
    }, 202));
};
