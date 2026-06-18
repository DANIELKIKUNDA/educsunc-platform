import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesNotifications } from './DependancesRoutesNotifications';
import { appliquerPoliciesRouteNotifications, executerRouteNotifications } from './_route-helpers';

// Ce fichier declare les routes HTTP principales du module Notifications.

/** Cette fonction cree le plugin Fastify des routes metiers principales Notifications. */
export const creerRoutesNotifications = (
  dependances: DependancesRoutesNotifications,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/v1/notifications', (requete, reponse) =>
    executerRouteNotifications(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteNotifications(dependances, requete, reponse, {
        permission: 'notifications.create',
        scope: 'ECOLE',
      });
      return dependances.controleurNotificationsHttp.creer({
        body: requete.body as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));

  serveur.get('/api/v1/notifications', (requete, reponse) =>
    executerRouteNotifications(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteNotifications(dependances, requete, reponse, {
        permission: 'notifications.read',
        scope: 'ECOLE',
      });
      return dependances.controleurNotificationsHttp.lister({
        query: requete.query as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));

  serveur.get('/api/v1/notifications/:id', (requete, reponse) =>
    executerRouteNotifications(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteNotifications(dependances, requete, reponse, {
        permission: 'notifications.read',
        scope: 'ECOLE',
      });
      return dependances.controleurNotificationsHttp.consulterParId({
        params: requete.params as never,
        query: requete.query as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));

  serveur.get('/api/v1/notifications/:id/timeline', (requete, reponse) =>
    executerRouteNotifications(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteNotifications(dependances, requete, reponse, {
        permission: 'notifications.timeline.read',
        scope: 'ECOLE',
      });
      return dependances.controleurNotificationsHttp.obtenirChronologie({
        params: requete.params as never,
        query: requete.query as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));

  serveur.post('/api/v1/notifications/:id/acknowledge', (requete, reponse) =>
    executerRouteNotifications(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteNotifications(dependances, requete, reponse, {
        permission: 'notifications.acknowledge',
        scope: 'ECOLE',
      });
      return dependances.controleurNotificationsHttp.accuserReception({
        params: requete.params as never,
        body: requete.body as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));

  serveur.post('/api/v1/notifications/:id/escalate', (requete, reponse) =>
    executerRouteNotifications(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteNotifications(dependances, requete, reponse, {
        permission: 'notifications.escalate',
        scope: 'ECOLE',
      });
      return dependances.controleurNotificationsHttp.escalader({
        params: requete.params as never,
        body: requete.body as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));
};
