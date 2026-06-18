import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesNotifications } from './DependancesRoutesNotifications';
import { appliquerPoliciesRouteNotifications, executerRouteNotifications } from './_route-helpers';

// Ce fichier declare les routes HTTP d'administration Notifications.

/** Cette fonction cree le plugin Fastify des routes d'administration Notifications. */
export const creerRoutesAdministrationNotifications = (
  dependances: DependancesRoutesNotifications,
): FastifyPluginAsync => async (serveur) => {
  serveur.get('/api/v1/admin/notifications/archives', (requete, reponse) =>
    executerRouteNotifications(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteNotifications(dependances, requete, reponse, {
        permission: 'notifications.admin.archives.read',
        scope: 'ORGANISATION',
        admin: true,
      });
      return dependances.controleurAdministrationNotificationsHttp.obtenirArchives({
        query: requete.query as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));

  serveur.get('/api/v1/admin/notifications/tenant', (requete, reponse) =>
    executerRouteNotifications(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteNotifications(dependances, requete, reponse, {
        permission: 'notifications.admin.tenant.read',
        scope: 'ORGANISATION',
        admin: true,
      });
      return dependances.controleurAdministrationNotificationsHttp.obtenirVueTenant({
        query: requete.query as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));

  serveur.get('/api/v1/admin/notifications/:id/escalades', (requete, reponse) =>
    executerRouteNotifications(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteNotifications(dependances, requete, reponse, {
        permission: 'notifications.admin.escalation.read',
        scope: 'ORGANISATION',
        admin: true,
      });
      return dependances.controleurAdministrationNotificationsHttp.obtenirTraceEscalade({
        params: requete.params as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));
};
