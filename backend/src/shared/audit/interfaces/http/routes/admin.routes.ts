import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesAudit } from './DependancesRoutesAudit';
import { appliquerPoliciesRouteAudit, executerRouteAudit } from './_route-helpers';

export const creerAdminRoutes = (dependances: DependancesRoutesAudit): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/v1/admin/retention/purge', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.admin.retention',
        admin: true,
        throttled: true,
        monitoring: true,
      });
      return dependances.auditRetentionController.purge({
        body: requete.body as never,
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
      });
    }, 202));

  serveur.post('/api/v1/admin/replay/massif', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.admin.replay',
        admin: true,
        throttled: true,
        replay: true,
      });
      return dependances.auditReplayController.rejouerAnalyticsAudit({
        body: requete.body as never,
        headers: requete.headers,
        context: requete.context,
      });
    }, 202));

  serveur.post('/api/v1/admin/recovery', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.admin.recovery',
        admin: true,
        throttled: true,
        synchronization: true,
      });
      return dependances.auditSynchronizationController.recupererSynchronisation({
        body: requete.body as never,
        headers: requete.headers,
        context: requete.context,
      });
    }, 202));
};
