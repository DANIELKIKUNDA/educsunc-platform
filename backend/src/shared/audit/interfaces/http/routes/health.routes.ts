import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesAudit } from './DependancesRoutesAudit';
import { appliquerPoliciesRouteAudit, executerRouteAudit } from './_route-helpers';

export const creerHealthRoutes = (dependances: DependancesRoutesAudit): FastifyPluginAsync => async (serveur) => {
  serveur.get('/api/v1/health', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.health.read',
        scope: 'ORGANISATION',
        monitoring: true,
      });
      return dependances.auditHealthController.health({ headers: requete.headers, context: requete.context });
    }));

  serveur.get('/api/v1/health/queues', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.health.read',
        scope: 'ORGANISATION',
        monitoring: true,
      });
      return dependances.auditHealthController.queues({ headers: requete.headers, context: requete.context });
    }));

  serveur.get('/api/v1/health/projections', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.health.read',
        scope: 'ORGANISATION',
        monitoring: true,
      });
      return dependances.auditHealthController.projections({ headers: requete.headers, context: requete.context });
    }));

  serveur.get('/api/v1/health/synchronization', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.health.read',
        scope: 'ORGANISATION',
        monitoring: true,
        synchronization: true,
      });
      return dependances.auditHealthController.synchronization({ headers: requete.headers, context: requete.context });
    }));
};
