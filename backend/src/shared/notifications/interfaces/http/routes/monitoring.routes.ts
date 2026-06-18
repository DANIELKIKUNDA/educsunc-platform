import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesNotifications } from './DependancesRoutesNotifications';
import { appliquerPoliciesRouteNotifications, executerRouteNotifications } from './_route-helpers';

// Ce fichier declare les routes HTTP de monitoring Notifications.

/** Cette fonction cree le plugin Fastify des routes de supervision Notifications. */
export const creerRoutesMonitoringNotifications = (
  dependances: DependancesRoutesNotifications,
): FastifyPluginAsync => async (serveur) => {
  serveur.get('/api/v1/notifications/monitoring', (requete, reponse) =>
    executerRouteNotifications(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteNotifications(dependances, requete, reponse, {
        permission: 'notifications.monitoring.read',
        scope: 'ECOLE',
        monitoring: true,
      });
      return dependances.controleurMonitoringNotificationsHttp.obtenirMonitoring({
        query: requete.query as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));

  serveur.get('/api/v1/notifications/dead-letter', (requete, reponse) =>
    executerRouteNotifications(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteNotifications(dependances, requete, reponse, {
        permission: 'notifications.dead-letter.read',
        scope: 'ECOLE',
        monitoring: true,
      });
      return dependances.controleurMonitoringNotificationsHttp.obtenirDeadLetters({
        query: requete.query as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));
};
