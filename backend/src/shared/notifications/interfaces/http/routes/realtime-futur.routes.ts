import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesNotifications } from './DependancesRoutesNotifications';
import { appliquerPoliciesRouteNotifications, executerRouteNotifications } from './_route-helpers';

// Ce fichier declare les routes HTTP du futur temps reel Notifications.

/** Cette fonction cree le plugin Fastify des routes preparatoires temps reel Notifications. */
export const creerRoutesTempsReelFuturNotifications = (
  dependances: DependancesRoutesNotifications,
): FastifyPluginAsync => async (serveur) => {
  serveur.get('/api/v1/notifications/realtime-futur/capabilities', (requete, reponse) =>
    executerRouteNotifications(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteNotifications(dependances, requete, reponse, {
        permission: 'notifications.realtime.read',
        scope: 'ORGANISATION',
        realtime: true,
      });
      return dependances.controleurTempsReelNotificationFuturHttp.obtenirCapacites({
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));

  serveur.post('/api/v1/notifications/realtime-futur/publish-test', (requete, reponse) =>
    executerRouteNotifications(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteNotifications(dependances, requete, reponse, {
        permission: 'notifications.realtime.publish',
        scope: 'ORGANISATION',
        realtime: true,
      });
      return dependances.controleurTempsReelNotificationFuturHttp.publierTest({
        body: requete.body as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));
};
