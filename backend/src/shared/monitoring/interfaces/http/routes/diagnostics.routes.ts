import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesMonitoring } from './DependancesRoutesMonitoring';
import { appliquerPoliciesRouteMonitoring, executerRouteMonitoring } from './_route-helpers';

// Ce fichier declare les routes HTTP des diagnostics Monitoring.

export const creerRoutesDiagnosticsMonitoring = (
  dependances: DependancesRoutesMonitoring,
): FastifyPluginAsync => async (serveur) => {
  serveur.get('/api/v1/monitoring/diagnostics', (requete, reponse) =>
    executerRouteMonitoring(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteMonitoring(dependances, requete, reponse, {
        permission: 'monitoring.diagnostics.read',
        scope: 'SYSTEM',
      });
      return dependances.controleurDiagnosticsMonitoringHttp.lister({
        query: requete.query as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context,
      });
    }));

  serveur.post('/api/v1/monitoring/incidents/:id/diagnostics', (requete, reponse) =>
    executerRouteMonitoring(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteMonitoring(dependances, requete, reponse, {
        permission: 'monitoring.diagnostics.create',
        scope: 'SYSTEM',
      });
      return dependances.controleurDiagnosticsMonitoringHttp.generer({
        params: requete.params as never,
        body: requete.body as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context,
      });
    }));
};
