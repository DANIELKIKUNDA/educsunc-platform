import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesMonitoring } from './DependancesRoutesMonitoring';
import { appliquerPoliciesRouteMonitoring, executerRouteMonitoring } from './_route-helpers';

// Ce fichier declare les routes HTTP des incidents Monitoring.

export const creerRoutesIncidentsMonitoring = (
  dependances: DependancesRoutesMonitoring,
): FastifyPluginAsync => async (serveur) => {
  serveur.get('/api/v1/monitoring/incidents', (requete, reponse) =>
    executerRouteMonitoring(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteMonitoring(dependances, requete, reponse, {
        permission: 'monitoring.incidents.read',
        scope: 'SYSTEM',
      });
      return dependances.controleurIncidentsMonitoringHttp.lister({
        query: requete.query as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context,
      });
    }));

  serveur.post('/api/v1/monitoring/incidents', (requete, reponse) =>
    executerRouteMonitoring(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteMonitoring(dependances, requete, reponse, {
        permission: 'monitoring.incidents.create',
        scope: 'SYSTEM',
      });
      return dependances.controleurIncidentsMonitoringHttp.ouvrir({
        body: requete.body as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context,
      });
    }));

  serveur.post('/api/v1/monitoring/incidents/:id/escalate', (requete, reponse) =>
    executerRouteMonitoring(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteMonitoring(dependances, requete, reponse, {
        permission: 'monitoring.incidents.escalate',
        scope: 'SYSTEM',
      });
      return dependances.controleurIncidentsMonitoringHttp.escalader({
        params: requete.params as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context,
      });
    }));
};
