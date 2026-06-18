import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesNotifications } from './DependancesRoutesNotifications';
import { appliquerPoliciesRouteNotifications, executerRouteNotifications } from './_route-helpers';

// Ce fichier declare les routes HTTP de retry Notifications.

/** Cette fonction cree le plugin Fastify des routes de retry Notifications. */
export const creerRoutesRetryNotifications = (
  dependances: DependancesRoutesNotifications,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/v1/notifications/:id/retry', (requete, reponse) =>
    executerRouteNotifications(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteNotifications(dependances, requete, reponse, {
        permission: 'notifications.retry.execute',
        scope: 'ECOLE',
        retry: true,
      });
      return dependances.controleurRetryNotificationHttp.controler({
        params: requete.params as never,
        body: requete.body as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));

  serveur.get('/api/v1/notifications/:id/retries', (requete, reponse) =>
    executerRouteNotifications(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteNotifications(dependances, requete, reponse, {
        permission: 'notifications.retry.read',
        scope: 'ECOLE',
        retry: true,
      });
      return dependances.controleurRetryNotificationHttp.obtenirHistorique({
        params: requete.params as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));
};
