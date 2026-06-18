import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesConfiguration } from './DependancesRoutesConfiguration';
import { appliquerPoliciesRouteConfiguration, executerRouteConfiguration } from './_route-helpers';

// Ce fichier declare les routes HTTP principales du module Configuration.

export const creerRoutesConfiguration = (
  dependances: DependancesRoutesConfiguration,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/v1/configuration', (requete, reponse) =>
    executerRouteConfiguration(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteConfiguration(dependances, requete, reponse, {
        permission: 'configuration.create',
        scope: 'CONFIGURATION_SCOPE_BODY',
        familleAction: 'WRITE',
      });
      return dependances.controleurConfigurationHttp.creer({
        body: requete.body as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));

  serveur.get('/api/v1/configuration/:id', (requete, reponse) =>
    executerRouteConfiguration(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteConfiguration(dependances, requete, reponse, {
        permission: 'configuration.read',
        scope: 'CONFIGURATION_SCOPE_EXISTING',
        familleAction: 'READ',
      });
      return dependances.controleurConfigurationHttp.consulterParId({
        params: requete.params as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));

  serveur.put('/api/v1/configuration/:id', (requete, reponse) =>
    executerRouteConfiguration(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteConfiguration(dependances, requete, reponse, {
        permission: 'configuration.update',
        scope: 'CONFIGURATION_SCOPE_EXISTING',
        familleAction: 'WRITE',
      });
      return dependances.controleurConfigurationHttp.mettreAJour({
        params: requete.params as never,
        body: requete.body as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));

  serveur.delete('/api/v1/configuration/:id', (requete, reponse) =>
    executerRouteConfiguration(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteConfiguration(dependances, requete, reponse, {
        permission: 'configuration.delete',
        scope: 'CONFIGURATION_SCOPE_EXISTING',
        familleAction: 'WRITE',
      });
      return dependances.controleurConfigurationHttp.supprimer({
        params: requete.params as never,
        body: requete.body as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));

  serveur.post('/api/v1/configuration/:id/lock', (requete, reponse) =>
    executerRouteConfiguration(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteConfiguration(dependances, requete, reponse, {
        permission: 'configuration.lock',
        scope: 'CONFIGURATION_SCOPE_EXISTING',
        familleAction: 'WRITE',
      });
      return dependances.controleurConfigurationHttp.verrouiller({
        params: requete.params as never,
        body: requete.body as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));

  serveur.post('/api/v1/configuration/:id/unlock', (requete, reponse) =>
    executerRouteConfiguration(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteConfiguration(dependances, requete, reponse, {
        permission: 'configuration.unlock',
        scope: 'CONFIGURATION_SCOPE_EXISTING',
        familleAction: 'WRITE',
      });
      return dependances.controleurConfigurationHttp.deverrouiller({
        params: requete.params as never,
        body: requete.body as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));

  serveur.post('/api/v1/configuration/:id/override', (requete, reponse) =>
    executerRouteConfiguration(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteConfiguration(dependances, requete, reponse, {
        permission: 'configuration.override',
        scope: 'CONFIGURATION_SCOPE_BODY',
        familleAction: 'WRITE',
      });
      return dependances.controleurConfigurationHttp.surcharger({
        params: requete.params as never,
        body: requete.body as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));

  serveur.get('/api/v1/configuration/effective', (requete, reponse) =>
    executerRouteConfiguration(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteConfiguration(dependances, requete, reponse, {
        permission: 'configuration.effective.read',
        scope: 'CONFIGURATION_SCOPE_QUERY',
        familleAction: 'READ',
      });
      return dependances.controleurConfigurationHttp.consulterEffective({
        query: requete.query as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));
};
