import type { FastifyPluginAsync } from 'fastify';

import { routeAuth } from './auth.routes';
import { routeBulletinsEvaluations } from './bulletins-evaluations.routes';
import { routeAudit } from './audit.routes';
import { moduleActivationConfigurationService, routeConfiguration } from './configuration.routes';
import { routeHealth } from './health.routes';
import { routeMonitoring } from './monitoring.routes';
import { routeNotifications } from './notifications.routes';
import { routePaiementsFacturation } from './paiements-facturation.routes';
import { routeReferentielAcademique } from './referentiel-academique.routes';
import { routeSecurity } from './security.routes';
import { routeScolariteEleves } from './scolarite-eleves.routes';
import type { TypeModuleConfiguration } from '../../shared/configuration/domain/enums/TypeModuleConfiguration';

type RouteGlobale = FastifyPluginAsync & { prefixe: string };

export function routeReferentielAcademiqueEstGouvernancePlateforme(url: string): boolean {
  return (
    url.startsWith('/api/organisations')
    || url.startsWith('/api/ecoles')
    || url.startsWith('/api/sections-scolaires')
    || url.startsWith('/api/classes-academiques')
    || url.startsWith('/api/options-etudes')
    || url.startsWith('/api/referentiels')
    || url.startsWith('/api/migrations-referentiel')
  );
}

const routesActives: readonly RouteGlobale[] = [
  routeAuth,
  routeAudit,
  routeConfiguration,
  routeMonitoring,
  routeNotifications,
  routeReferentielAcademique,
  routeSecurity,
  routeScolariteEleves,
  routePaiementsFacturation,
  routeBulletinsEvaluations,
];

const routesPrevues: readonly RouteGlobale[] = [];

// Agrege les routes globales deja actives.
export const registerGlobalRoutes: FastifyPluginAsync = async (serveur) => {
  await serveur.register(routeHealth);
  await serveur.register(routeAuth);
  await serveur.register(routeSecurity);
  await serveur.register(routeConfiguration);
  await enregistrerRouteModule(serveur, routeAudit, 'AUDIT');
  await enregistrerRouteModule(serveur, routeMonitoring, 'MONITORING');
  await enregistrerRouteModule(serveur, routeNotifications, 'NOTIFICATIONS');
  await enregistrerRouteModule(serveur, routeReferentielAcademique, 'REFERENTIEL_ACADEMIQUE');
  await enregistrerRouteModule(serveur, routeScolariteEleves, 'SCOLARITE_ELEVES');
  await enregistrerRouteModule(serveur, routePaiementsFacturation, 'PAIEMENTS_FACTURATION');
  await enregistrerRouteModule(serveur, routeBulletinsEvaluations, 'BULLETINS_EVALUATIONS');

  serveur.log.debug(
    {
      routesActives: routesActives.map((route) => route.prefixe),
      routesPrevues: routesPrevues.map((route) => route.prefixe),
    },
    'Routes globales initialisees.',
  );
};

async function enregistrerRouteModule(
  serveur: Parameters<FastifyPluginAsync>[0],
  route: RouteGlobale,
  module: TypeModuleConfiguration,
): Promise<void> {
  await serveur.register(async (instance) => {
    instance.addHook('preHandler', async (requete, reponse) => {
      const organisationId = requete.context?.organisationActiveId;
      const ecoleId = (
        module === 'REFERENTIEL_ACADEMIQUE' && routeReferentielAcademiqueEstGouvernancePlateforme(requete.url)
      )
        ? undefined
        : requete.context?.ecoleActiveId;
      const actif = await moduleActivationConfigurationService.moduleActif({
        organisationId,
        ecoleId,
        module,
      });

      if (actif) {
        return;
      }

      reponse.code(403).send({
        code: 'MODULE_INACTIF',
        message: `Le module ${module} n'est pas actif pour l'ecole courante.`,
      });
    });

    await instance.register(route);
  });
}
