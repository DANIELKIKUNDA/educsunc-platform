import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesRealtime } from './DependancesRoutesRealtime';
import { appliquerPoliciesRouteRealtime, executerRouteRealtime } from './_route-helpers';

export const creerRoutesConnexionsRealtime = (
  dependances: DependancesRoutesRealtime,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/v1/realtime/connections', (requete, reponse) =>
    executerRouteRealtime(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteRealtime(dependances, requete, reponse, {
        permission: 'realtime.connections.write',
        scope: 'USER',
      });
      return dependances.controleurConnexionsRealtimeHttp.ouvrir({
        body: requete.body as never,
        headers: requete.headers,
      });
    }));

  serveur.post('/api/v1/realtime/connections/close', (requete, reponse) =>
    executerRouteRealtime(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteRealtime(dependances, requete, reponse, {
        permission: 'realtime.connections.write',
        scope: 'USER',
      });
      return dependances.controleurConnexionsRealtimeHttp.fermer({
        body: requete.body as never,
        headers: requete.headers,
      });
    }));

  serveur.post('/api/v1/realtime/connections/reconnect', (requete, reponse) =>
    executerRouteRealtime(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteRealtime(dependances, requete, reponse, {
        permission: 'realtime.connections.write',
        scope: 'USER',
      });
      return dependances.controleurConnexionsRealtimeHttp.reconnecter({
        body: requete.body as never,
        headers: requete.headers,
      });
    }));
};
