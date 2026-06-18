import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesRealtime } from './DependancesRoutesRealtime';
import { appliquerPoliciesRouteRealtime, executerRouteRealtime } from './_route-helpers';

export const creerRoutesDiagnosticsRealtime = (
  dependances: DependancesRoutesRealtime,
): FastifyPluginAsync => async (serveur) => {
  serveur.get('/api/v1/realtime/diagnostics', (requete, reponse) =>
    executerRouteRealtime(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteRealtime(dependances, requete, reponse, {
        permission: 'realtime.diagnostics.read',
        scope: 'SYSTEM',
      });
      return dependances.controleurDiagnosticsRealtimeHttp.consulter({
        query: requete.query as never,
        headers: requete.headers,
      });
    }));
};
