import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesMonitoring } from './DependancesRoutesMonitoring';
import { appliquerPoliciesRouteMonitoring, executerRouteMonitoring } from './_route-helpers';

// Ce fichier declare les routes HTTP des alertes Monitoring.

export const creerRoutesAlertesMonitoring = (
  dependances: DependancesRoutesMonitoring,
): FastifyPluginAsync => async (serveur) => {
  serveur.get('/api/v1/monitoring/alerts', (requete, reponse) =>
    executerRouteMonitoring(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteMonitoring(dependances, requete, reponse, {
        permission: 'monitoring.alerts.read',
        scope: 'SYSTEM',
      });
      return dependances.controleurAlertesMonitoringHttp.lister({
        query: requete.query as never,
        headers: requete.headers,
      });
    }));

  serveur.post('/api/v1/monitoring/alerts', (requete, reponse) =>
    executerRouteMonitoring(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteMonitoring(dependances, requete, reponse, {
        permission: 'monitoring.alerts.create',
        scope: 'SYSTEM',
      });
      return dependances.controleurAlertesMonitoringHttp.creer({
        body: requete.body as never,
        headers: requete.headers,
      });
    }));

  serveur.post('/api/v1/monitoring/alerts/:id/resolve', (requete, reponse) =>
    executerRouteMonitoring(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteMonitoring(dependances, requete, reponse, {
        permission: 'monitoring.alerts.resolve',
        scope: 'SYSTEM',
      });
      return dependances.controleurAlertesMonitoringHttp.resoudre({
        params: requete.params as never,
        body: requete.body as never,
        headers: requete.headers,
      });
    }));
};
