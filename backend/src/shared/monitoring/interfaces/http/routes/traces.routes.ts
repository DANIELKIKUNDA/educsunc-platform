import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesMonitoring } from './DependancesRoutesMonitoring';
import { appliquerPoliciesRouteMonitoring, executerRouteMonitoring } from './_route-helpers';

// Ce fichier declare les routes HTTP des traces Monitoring.

export const creerRoutesTracesMonitoring = (
  dependances: DependancesRoutesMonitoring,
): FastifyPluginAsync => async (serveur) => {
  serveur.get('/api/v1/monitoring/traces', (requete, reponse) =>
    executerRouteMonitoring(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteMonitoring(dependances, requete, reponse, {
        permission: 'monitoring.traces.read',
        scope: 'SYSTEM',
      });
      return dependances.controleurTracesMonitoringHttp.lister({
        query: requete.query as never,
        headers: requete.headers,
      });
    }));

  serveur.post('/api/v1/monitoring/traces', (requete, reponse) =>
    executerRouteMonitoring(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteMonitoring(dependances, requete, reponse, {
        permission: 'monitoring.traces.create',
        scope: 'SYSTEM',
      });
      return dependances.controleurTracesMonitoringHttp.capturer({
        body: requete.body as never,
        headers: requete.headers,
      });
    }));
};
