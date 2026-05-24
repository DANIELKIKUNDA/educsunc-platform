import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesAudit } from './DependancesRoutesAudit';
import { appliquerPoliciesRouteAudit, executerRouteAudit } from './_route-helpers';

export const creerInternalRoutes = (dependances: DependancesRoutesAudit): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/v1/internal/rebuild/projections', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.internal.rebuild',
        internal: true,
        admin: true,
        throttled: true,
        replay: true,
      });
      return dependances.auditReplayController.rejouerProjectionsAudit({
        body: requete.body as never,
        headers: requete.headers,
        context: requete.context,
      });
    }, 202));

  serveur.post('/api/v1/internal/recovery', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.internal.recovery',
        internal: true,
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
