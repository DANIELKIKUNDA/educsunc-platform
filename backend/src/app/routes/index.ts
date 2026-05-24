import type { FastifyPluginAsync } from 'fastify';

import { routeBulletinsEvaluations } from './bulletins-evaluations.routes';
import { routeAudit } from './audit.routes';
import { routeHealth } from './health.routes';
import { routePaiementsFacturation } from './paiements-facturation.routes';
import { routeReferentielAcademique } from './referentiel-academique.routes';
import { routeScolariteEleves } from './scolarite-eleves.routes';

const routesActives = [routeAudit, routeReferentielAcademique, routeScolariteEleves];

const routesPrevues = [
  routePaiementsFacturation,
  routeBulletinsEvaluations,
];

// Agrege les routes globales deja actives.
export const registerGlobalRoutes: FastifyPluginAsync = async (serveur) => {
  await serveur.register(routeHealth);
  await serveur.register(routeAudit);
  await serveur.register(routeReferentielAcademique);
  await serveur.register(routeScolariteEleves);

  serveur.log.debug(
    {
      routesActives: routesActives.map((route) => route.prefixe),
      routesPrevues: routesPrevues.map((route) => route.prefixe),
    },
    'Routes globales initialisees.',
  );
};
