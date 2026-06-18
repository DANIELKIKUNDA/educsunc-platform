import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesConfiguration } from './DependancesRoutesConfiguration';
import { appliquerPoliciesRouteConfiguration, executerRouteConfiguration } from './_route-helpers';

// Ce fichier declare les routes HTTP de propagation Configuration.

export const creerRoutesPropagationConfiguration = (
  dependances: DependancesRoutesConfiguration,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/v1/configuration/:id/propagate', (requete, reponse) =>
    executerRouteConfiguration(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteConfiguration(dependances, requete, reponse, {
        permission: 'configuration.propagate',
        scope: 'CONFIGURATION_SCOPE_EXISTING',
        familleAction: 'WRITE',
      });
      return dependances.controleurPropagationConfigurationHttp.propager({
        params: requete.params as never,
        body: requete.body as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));
};
