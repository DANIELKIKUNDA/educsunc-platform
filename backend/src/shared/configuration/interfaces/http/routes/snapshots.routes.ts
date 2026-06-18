import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesConfiguration } from './DependancesRoutesConfiguration';
import { appliquerPoliciesRouteConfiguration, executerRouteConfiguration } from './_route-helpers';

// Ce fichier declare les routes HTTP des snapshots Configuration.

export const creerRoutesSnapshotsConfiguration = (
  dependances: DependancesRoutesConfiguration,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/v1/configuration/:id/snapshots', (requete, reponse) =>
    executerRouteConfiguration(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteConfiguration(dependances, requete, reponse, {
        permission: 'configuration.snapshots.create',
        scope: 'CONFIGURATION_SCOPE_EXISTING',
        familleAction: 'WRITE',
      });
      return dependances.controleurSnapshotsConfigurationHttp.creer({
        params: requete.params as never,
        body: requete.body as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));

  serveur.get('/api/v1/configuration/:id/snapshots/compare', (requete, reponse) =>
    executerRouteConfiguration(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteConfiguration(dependances, requete, reponse, {
        permission: 'configuration.snapshots.compare',
        scope: 'CONFIGURATION_SCOPE_EXISTING',
        familleAction: 'READ',
      });
      return dependances.controleurSnapshotsConfigurationHttp.comparer({
        params: requete.params as never,
        query: requete.query as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));
};
