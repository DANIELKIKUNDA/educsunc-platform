import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesNotifications } from './DependancesRoutesNotifications';
import { appliquerPoliciesRouteNotifications, executerRouteNotifications } from './_route-helpers';

// Ce fichier declare les routes HTTP de replay Notifications.

/** Cette fonction cree le plugin Fastify des routes de rejeu Notifications. */
export const creerRoutesReplayNotifications = (
  dependances: DependancesRoutesNotifications,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/v1/notifications/:id/replay', (requete, reponse) =>
    executerRouteNotifications(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteNotifications(dependances, requete, reponse, {
        permission: 'notifications.replay.execute',
        scope: 'ECOLE',
        replay: true,
      });
      return dependances.controleurReplayNotificationHttp.rejouer({
        params: requete.params as never,
        body: requete.body as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));

  serveur.get('/api/v1/notifications/:id/replay/diagnostic', (requete, reponse) =>
    executerRouteNotifications(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteNotifications(dependances, requete, reponse, {
        permission: 'notifications.replay.read',
        scope: 'ECOLE',
        replay: true,
      });
      return dependances.controleurReplayNotificationHttp.obtenirDiagnostic({
        params: requete.params as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));
};
