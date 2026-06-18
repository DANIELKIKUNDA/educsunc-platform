import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesConfiguration } from './DependancesRoutesConfiguration';
import { appliquerPoliciesRouteConfiguration, executerRouteConfiguration } from './_route-helpers';

// Ce fichier declare les routes HTTP de validation Configuration.

export const creerRoutesValidationConfiguration = (
  dependances: DependancesRoutesConfiguration,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/v1/configuration/validate', (requete, reponse) =>
    executerRouteConfiguration(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteConfiguration(dependances, requete, reponse, {
        permission: 'configuration.validate',
        scope: 'CONFIGURATION_SCOPE_BODY',
        familleAction: 'WRITE',
      });
      return dependances.controleurValidationConfigurationHttp.valider({
        body: requete.body as never,
        headers: requete.headers,
        context: (requete as { context?: unknown }).context as never,
      });
    }));
};
