import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesMonitoring } from './DependancesRoutesMonitoring';
import { appliquerPoliciesRouteMonitoring, executerRouteMonitoring } from './_route-helpers';

// Ce fichier declare les routes HTTP de capacite Monitoring.

export const creerRoutesCapaciteMonitoring = (
  dependances: DependancesRoutesMonitoring,
): FastifyPluginAsync => async (serveur) => {
  serveur.get('/api/v1/monitoring/capacity', (requete, reponse) =>
    executerRouteMonitoring(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteMonitoring(dependances, requete, reponse, {
        permission: 'monitoring.capacity.read',
        scope: 'SYSTEM',
      });
      return dependances.controleurCapaciteMonitoringHttp.lister({
        query: requete.query as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context,
      });
    }));

  serveur.post('/api/v1/monitoring/capacity', (requete, reponse) =>
    executerRouteMonitoring(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteMonitoring(dependances, requete, reponse, {
        permission: 'monitoring.capacity.calculate',
        scope: 'SYSTEM',
      });
      return dependances.controleurCapaciteMonitoringHttp.calculerCapacite({
        body: requete.body as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context,
      });
    }));

  serveur.post('/api/v1/monitoring/capacity/saturation', (requete, reponse) =>
    executerRouteMonitoring(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteMonitoring(dependances, requete, reponse, {
        permission: 'monitoring.saturation.calculate',
        scope: 'SYSTEM',
      });
      return dependances.controleurCapaciteMonitoringHttp.calculerSaturation({
        body: requete.body as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context,
      });
    }));
};
