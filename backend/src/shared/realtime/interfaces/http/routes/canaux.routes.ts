import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesRealtime } from './DependancesRoutesRealtime';
import { appliquerPoliciesRouteRealtime, executerRouteRealtime } from './_route-helpers';

export const creerRoutesCanauxRealtime = (
  dependances: DependancesRoutesRealtime,
): FastifyPluginAsync => async (serveur) => {
  serveur.get('/api/v1/realtime/channels', (requete, reponse) =>
    executerRouteRealtime(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteRealtime(dependances, requete, reponse, {
        permission: 'realtime.channels.read',
        scope: 'SCHOOL',
      });
      return dependances.controleurCanauxRealtimeHttp.lister({
        query: requete.query as never,
        headers: requete.headers,
      });
    }));
};
