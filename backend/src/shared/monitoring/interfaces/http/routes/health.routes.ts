import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesMonitoring } from './DependancesRoutesMonitoring';
import { appliquerPoliciesRouteMonitoring, executerRouteMonitoring } from './_route-helpers';

// Ce fichier declare les routes HTTP de sante Monitoring.

export const creerRoutesHealthMonitoring = (
  dependances: DependancesRoutesMonitoring,
): FastifyPluginAsync => async (serveur) => {
  serveur.get('/api/v1/monitoring/health', (requete, reponse) =>
    executerRouteMonitoring(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteMonitoring(dependances, requete, reponse, {
        permission: 'monitoring.health.read',
        scope: 'SYSTEM',
      });
      return dependances.controleurHealthMonitoringHttp.consulterEtat({
        query: requete.query as never,
        headers: requete.headers,
      });
    }));

  serveur.get('/api/v1/monitoring/health/snapshot', (requete, reponse) =>
    executerRouteMonitoring(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteMonitoring(dependances, requete, reponse, {
        permission: 'monitoring.health.snapshot.read',
        scope: 'SYSTEM',
      });
      return dependances.controleurHealthMonitoringHttp.consulterSnapshot({
        query: requete.query as never,
        headers: requete.headers,
      });
    }));
};
