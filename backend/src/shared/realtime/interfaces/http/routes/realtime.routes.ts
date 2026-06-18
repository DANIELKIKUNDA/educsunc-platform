import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesRealtime } from './DependancesRoutesRealtime';
import { appliquerPoliciesRouteRealtime, executerRouteRealtime } from './_route-helpers';

export const creerRoutesRealtime = (
  dependances: DependancesRoutesRealtime,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/v1/realtime/events', (requete, reponse) =>
    executerRouteRealtime(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteRealtime(dependances, requete, reponse, {
        permission: 'realtime.publish',
        scope: 'SCHOOL',
      });
      return dependances.controleurRealtimeHttp.publier({
        body: requete.body as never,
        headers: requete.headers,
      });
    }));

  serveur.post('/api/v1/realtime/messages', (requete, reponse) =>
    executerRouteRealtime(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteRealtime(dependances, requete, reponse, {
        permission: 'realtime.broadcast',
        scope: 'SCHOOL',
      });
      return dependances.controleurRealtimeHttp.diffuser({
        body: requete.body as never,
        headers: requete.headers,
      });
    }));

  serveur.get('/api/v1/realtime/state', (requete, reponse) =>
    executerRouteRealtime(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteRealtime(dependances, requete, reponse, {
        permission: 'realtime.read',
        scope: 'SCHOOL',
      });
      return dependances.controleurRealtimeHttp.consulterEtat({
        query: requete.query as never,
        headers: requete.headers,
      });
    }));

  serveur.post('/api/v1/realtime/verify', (requete, reponse) =>
    executerRouteRealtime(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteRealtime(dependances, requete, reponse, {
        permission: 'realtime.verify',
        scope: 'SCHOOL',
      });
      return dependances.controleurRealtimeHttp.verifierDiffusabilite({
        body: requete.body as never,
        headers: requete.headers,
      });
    }));
};
