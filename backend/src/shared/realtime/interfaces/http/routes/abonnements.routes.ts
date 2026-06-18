import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesRealtime } from './DependancesRoutesRealtime';
import { appliquerPoliciesRouteRealtime, executerRouteRealtime } from './_route-helpers';

export const creerRoutesAbonnementsRealtime = (
  dependances: DependancesRoutesRealtime,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/v1/realtime/subscriptions', (requete, reponse) =>
    executerRouteRealtime(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteRealtime(dependances, requete, reponse, {
        permission: 'realtime.subscriptions.write',
        scope: 'USER',
      });
      return dependances.controleurAbonnementsRealtimeHttp.abonner({
        body: requete.body as never,
        headers: requete.headers,
      });
    }));

  serveur.post('/api/v1/realtime/subscriptions/unsubscribe', (requete, reponse) =>
    executerRouteRealtime(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteRealtime(dependances, requete, reponse, {
        permission: 'realtime.subscriptions.write',
        scope: 'USER',
      });
      return dependances.controleurAbonnementsRealtimeHttp.desabonner({
        body: requete.body as never,
        headers: requete.headers,
      });
    }));
};
