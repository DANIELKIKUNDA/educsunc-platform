import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesMonitoring } from './DependancesRoutesMonitoring';
import { appliquerPoliciesRouteMonitoring, executerRouteMonitoring } from './_route-helpers';

// Ce fichier declare les routes HTTP Monitoring globales.

export const creerRoutesMonitoring = (
  dependances: DependancesRoutesMonitoring,
): FastifyPluginAsync => async (serveur) => {
  serveur.get('/api/v1/monitoring/state', (requete, reponse) =>
    executerRouteMonitoring(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteMonitoring(dependances, requete, reponse, {
        permission: 'monitoring.read',
        scope: 'SYSTEM',
      });
      return dependances.controleurMonitoringHttp.consulterEtat({
        query: requete.query as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context,
      });
    }));

  serveur.get('/api/v1/monitoring/dashboard', (requete, reponse) =>
    executerRouteMonitoring(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteMonitoring(dependances, requete, reponse, {
        permission: 'monitoring.dashboard.read',
        scope: 'SYSTEM',
      });
      return dependances.controleurMonitoringHttp.consulterTableauBord({
        query: requete.query as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context,
      });
    }));

  serveur.get('/api/v1/monitoring/observability', (requete, reponse) =>
    executerRouteMonitoring(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteMonitoring(dependances, requete, reponse, {
        permission: 'monitoring.observability.read',
        scope: 'SYSTEM',
      });
      return dependances.controleurMonitoringHttp.consulterObservabilite({
        query: requete.query as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context,
      });
    }));
};
